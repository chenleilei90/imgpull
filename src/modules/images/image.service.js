const SyncedImageModel = require('../../models/synced-image.model');
const AppError = require('../../utils/app-error');
const TaskService = require('../tasks/task.service');

class ImageService {
  static async list(userId, query) {
    const filters = {
      page: Number(query.page || 1),
      pageSize: Number(query.page_size || 15),
      keyword: query.keyword || null,
      registryAccountId: query.registry_account_id ? Number(query.registry_account_id) : null
    };

    const [items, totalRow] = await Promise.all([
      SyncedImageModel.listByUser(userId, filters),
      SyncedImageModel.countByUser(userId, filters)
    ]);

    return {
      items,
      pagination: {
        page: filters.page,
        page_size: filters.pageSize,
        total: Number(totalRow?.total || 0)
      }
    };
  }

  static async detail(userId, imageId) {
    const image = await SyncedImageModel.findByIdForUser(imageId, userId);
    if (!image) {
      throw new AppError(404, 40441, '镜像记录不存在');
    }
    return image;
  }

  static async resync(userId, imageId) {
    const image = await SyncedImageModel.findByIdForUser(imageId, userId);
    if (!image) {
      throw new AppError(404, 40442, '镜像记录不存在');
    }

    return TaskService.create(
      userId,
      {
        registry_account_id: image.registry_account_id,
        overwrite_on_exists: true,
        images: [image.source_ref]
      },
      'web'
    );
  }
}

module.exports = ImageService;
