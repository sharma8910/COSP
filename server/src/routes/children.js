import { Router } from 'express';
import { Child } from '../models/Child.js';
import { Device } from '../models/Device.js';
import { requireAuth } from '../auth.js';
import { randomBytes, createHash } from 'node:crypto';

const router = Router();
router.use(requireAuth);

const publicChild = (child) => ({ id: child._id, name: child.name, ageGroup: child.ageGroup, createdAt: child.createdAt });
const hashToken = (token) => createHash('sha256').update(token).digest('hex');

router.get('/', async (request, response, next) => {
  try {
    const children = await Child.find({ parentId: request.user._id }).sort({ createdAt: 1 });
    return response.json({ children: children.map(publicChild) });
  } catch (error) { return next(error); }
});

router.post('/', async (request, response, next) => {
  try {
    const { name, ageGroup } = request.body;
    const validGroups = ['under-8', '8-12', '13-15', '16-17'];
    if (typeof name !== 'string' || !name.trim() || !validGroups.includes(ageGroup)) {
      return response.status(400).json({ error: 'Name and a valid age group are required' });
    }
    const child = await Child.create({ parentId: request.user._id, name: name.trim(), ageGroup });
    return response.status(201).json({ child: publicChild(child) });
  } catch (error) { return next(error); }
});

router.delete('/:childId', async (request, response, next) => {
  try {
    const child = await Child.findOneAndDelete({ _id: request.params.childId, parentId: request.user._id });
    if (!child) return response.status(404).json({ error: 'Child not found' });
    await Device.updateMany({ childId: child._id, parentId: request.user._id }, { status: 'revoked' });
    return response.status(204).send();
  } catch (error) { return next(error); }
});

router.post('/:childId/devices', async (request, response, next) => {
  try {
    const { deviceName } = request.body;
    const child = await Child.findOne({ _id: request.params.childId, parentId: request.user._id });
    if (!child) return response.status(404).json({ error: 'Child not found' });
    if (typeof deviceName !== 'string' || !deviceName.trim()) return response.status(400).json({ error: 'Device name is required' });



    const deviceToken = randomBytes(32).toString('hex');
    const device = await Device.create({ parentId: request.user._id, childId: child._id, deviceName: deviceName.trim(), deviceTokenHash: hashToken(deviceToken) }); //device token is hashed and stored in the database for security reasons, while the plain token is returned to the client for use in authentication
    return response.status(201).json({ device: { id: device._id, deviceName: device.deviceName, status: device.status }, deviceToken });
  } catch (error) { return next(error); }
});

router.get('/:childId/devices', async (request, response, next) => {
  
  try {
    
    const child = await Child.findOne({ _id: request.params.childId, parentId: request.user._id });
    if (!child) return response.status(404).json({ error: 'Child not found' });
    const devices = await Device.find({ childId: request.params.childId, parentId: request.user._id }).sort({ createdAt: 1 });
    return response.json({ devices: devices.map((device) => ({ id: device._id, deviceName: device.deviceName, status: device.status, lastSeenAt: device.lastSeenAt, createdAt: device.createdAt })) });
  } catch (error) { return next(error); }
});

router.delete('/:childId/devices/:deviceId', async (request, response, next) => {
  try {
    const device = await Device.findOneAndUpdate({ _id: request.params.deviceId, childId: request.params.childId, parentId: request.user._id }, { status: 'revoked' }, { new: true });
    if (!device) return response.status(404).json({ error: 'Device not found' });
    return response.status(204).send();
  } catch (error) { return next(error); }
});

export default router;
