import { FastifyPluginAsync } from 'fastify';
import { cpu, mem, osInfo } from 'systeminformation';

export const systemRoutes: FastifyPluginAsync = async (fastify) => {
  // Get basic system information
  fastify.get('/api/system/info', async () => {
    const [cpuInfo, memInfo, os] = await Promise.all([cpu(), mem(), osInfo()]);

    return {
      cpu: {
        manufacturer: cpuInfo.manufacturer,
        brand: cpuInfo.brand,
        cores: cpuInfo.cores,
        physicalCores: cpuInfo.physicalCores,
      },
      memory: {
        total: memInfo.total,
        free: memInfo.free,
        used: memInfo.used,
      },
      os: {
        platform: os.platform,
        distro: os.distro,
        release: os.release,
        arch: os.arch,
      },
    };
  });

  // Get memory usage
  fastify.get('/api/system/memory', async () => {
    const memInfo = await mem();
    return {
      total: memInfo.total,
      free: memInfo.free,
      used: memInfo.used,
      active: memInfo.active,
      available: memInfo.available,
      swapTotal: memInfo.swaptotal,
      swapUsed: memInfo.swapused,
      swapFree: memInfo.swapfree,
    };
  });
};
