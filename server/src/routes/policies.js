import { Router } from 'express';
import { createHash } from 'node:crypto';
import { Child } from '../models/Child.js';
import { Device } from '../models/Device.js';
import { Policy } from '../models/Policy.js';
import { ActivityEvent } from '../models/ActivityEvent.js';
import { requireAuth } from '../auth.js';
import redis from '../redis.js';

const router = Router();
const domainPattern = /^(?=.{1,253}$)(?!-)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;
const hashToken = (token) => createHash('sha256').update(token).digest('hex');

async function logBlockAttempt(device, domain, reason) {
  await ActivityEvent.create({
    parentId: device.parentId,
    childId: device.childId,
    deviceId: device._id,
    domain,
    reason,
    
  });
}

function normalizeDomain(value) {
  let domain = String(value || '').trim().toLowerCase();
  try { if (domain.includes('://')) domain = new URL(domain).hostname; } catch { return null; }
  domain = domain.replace(/^www\./, '');
  return domainPattern.test(domain) ? domain : null;
}

function publicPolicy(policy) {
  return { id: policy._id, childId: policy.childId, type: policy.type, domain: policy.domain, createdAt: policy.createdAt };
}

async function ownedChild(parentId, childId) {
  return Child.exists({ _id: childId, parentId });
}

router.get('/', requireAuth, async (request, response, next) => {
  try {
    const parentFilter = { parentId: request.user._id };
    if (request.query.childId) parentFilter.childId = request.query.childId;
    const policies = await Policy.find(parentFilter).sort({ domain: 1 });
    return response.json({ policies: policies.map(publicPolicy) });
  } catch (error) { return next(error); }
});

//create a new policy for a child, either an allowlist or blocklist entry for a specific domain
router.post('/', requireAuth, async (request, response, next) => {
  try {
    const { childId, type } = request.body;
    const domain = normalizeDomain(request.body.domain);
    if (!await ownedChild(request.user._id, childId)) return response.status(404).json({ error: 'Child not found' });

    if (!['allowlist', 'blocklist'].includes(type) || !domain) return response.status(400).json({ error: 'Valid childId, type, and domain are required' });

    const policy = await Policy.create({ parentId: request.user._id, childId, type, domain });

    const devices = await Device.find({ childId });
    devices.forEach(async (device) => {
      await redis.del(`policy:descision:${device._id}:${domain}`);
    })
    return response.status(201).json({ policy: publicPolicy(policy) });
  } catch (error) {
    if (error?.code === 11000) return response.status(409).json({ error: 'This domain rule already exists' });
    return next(error);
  }
});

router.delete('/:policyId', requireAuth, async (request, response, next) => {
  try {
    const policy = await Policy.findOneAndDelete({ _id: request.params.policyId, parentId: request.user._id });
    if (!policy) return response.status(404).json({ error: 'Policy not found' });
    const devices = await Device.find({ childId: policy.childId });
    devices.forEach(async (device) => {
      await redis.del(`policy:descision:${device._id}:${policy.domain}`);
    })
    return response.status(204).send();
  } catch (error) { return next(error); }
});

router.post('/check', async (request, response, next) => {
  try {
    // This endpoint is used by child devices to check if a specific domain is allowed or blocked based on the parent's policies.
    const { deviceToken } = request.body;
    const domain = normalizeDomain(request.body.domain);
    if (typeof deviceToken !== 'string' || !domain) return response.status(400).json({ error: 'Device token and valid domain are required' });
    
    // Find the device associated with the provided token and ensure it is active here hash token is re hashing the device token to compare with the stored hash in the database for security reasons
    const device = await Device.findOne({ deviceTokenHash: hashToken(deviceToken), status: 'active' });
    if (!device) return response.status(401).json({ error: 'Invalid device credentials' });


    await Device.updateOne({ _id: device._id }, { lastSeenAt: new Date() });

    const cacheKey = `policy:descision:${device._id}:${domain}`

    const cached = await redis.get(cacheKey)
    if(cached){
     console.log(`redis hit: ${cached}`);
     const result = JSON.parse(cached);
     if (result.descision === 'BLOCK') {
       await logBlockAttempt(device, domain, result.reason);
     }
     return response.json(result)
    }
    console.log(`redis miss: checking Mongo for ${domain}`);

    const matching = await Policy.find({ childId: device.childId, domain: { $in: [domain] } });
    // Check for inherited policies from parent domains (e.g., if the policy is set for "example.com", it should also apply to "sub.example.com")
    const parentDomains = domain.split('.').map((part, index, parts) => parts.slice(index).join('.'));

    const inheritedMatching = await Policy.find({ childId: device.childId, domain: { $in: parentDomains } });//in operator helps to find the every word in that present domain if anyone matches with the domain in Mongodb it sends back that

    const allMatching = [...matching, ...inheritedMatching.filter((candidate) => !matching.some((policy) => policy._id.equals(candidate._id)))];

    let result;
    let descision;
    let reason;
    
    if (allMatching.length === 0) {
      try{
        const aiHelp = await fetch("http://localhost:8000/work", {
        method: "POST",
        headers: {
          "Content-Type" : "application/json"
        },
        body: JSON.stringify({domain: domain})
      });
      
      

      const aiResult = await aiHelp.json();

      result = aiResult;
      descision = aiResult.descision;
      reason = aiResult.reason;
      }
      catch (error){
       
        descision = "ALLOW";
        reason = "ai_help_unavailable";
        result = { descision, domain, reason };
        console.error("No fetching AI help sorry as it cant be deploy in free tier", error);
        


      }
    } 
    

    else {
          descision = allMatching.find(policy => policy.type === "allowlist")
        ? "ALLOW"
        : allMatching.find(policy => policy.type === "blocklist")
        ? "BLOCK"
       : "ALLOW";
    
        reason = descision == 'BLOCK' ? 'parent_blocklist' : 'default_or_allowlist';

       result = { descision , domain ,reason};
    }
    await redis.set(cacheKey , JSON.stringify(result), 'EX', 300)
    if (descision === 'BLOCK') {
      await logBlockAttempt(device, domain, reason);
    }
    return response.json( result) ;
  
  } catch (error) { return next(error); }
});

export default router;
