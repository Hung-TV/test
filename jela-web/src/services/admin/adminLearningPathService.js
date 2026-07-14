import axiosClient from '../../api/axiosClient';
import { mockLearningPaths } from '../../data/adminMockData';
import {
  ADMIN_ENDPOINTS,
  USE_FAKE_ADMIN,
  fakeDelay,
  getAdminError,
  getAdminResponseData,
} from './adminConfig';

/**
 * Reserved for future development.
 * Quản lý lộ trình JLPT N5-N1 và các bài học thuộc từng lộ trình.
 *
 * Currently using mock data when USE_FAKE_ADMIN = true.
 * Switch USE_FAKE_ADMIN to false when BE APIs are ready.
 * UI hiện tại dùng adapter tương thích ở cuối file trong giai đoạn chuyển đổi.
 */

const clone = (value) => structuredClone(value);

const findPath = (level) =>
  mockLearningPaths.find((path) => path.level === String(level).toUpperCase());

const findLesson = (lessonId) => {
  for (const path of mockLearningPaths) {
    const lessonIndex = path.lessons.findIndex(
      (lesson) => String(lesson.id) === String(lessonId),
    );
    if (lessonIndex !== -1) return { path, lessonIndex };
  }
  throw new Error('Không tìm thấy bài học');
};

const syncPath = (path) => {
  path.lessons.sort((left, right) => left.order - right.order);
  path.totalLessons = path.lessons.length;
};

export async function getLearningPaths() {
  try {
    if (!USE_FAKE_ADMIN) {
      const response = await axiosClient.get(ADMIN_ENDPOINTS.learningPaths);
      return getAdminResponseData(response);
    }

    await fakeDelay();
    return clone(mockLearningPaths);
  } catch (error) {
    throw getAdminError(error, 'Không thể tải danh sách lộ trình học');
  }
}

export async function getLearningPathByLevel(level) {
  try {
    if (!USE_FAKE_ADMIN) {
      const response = await axiosClient.get(
        ADMIN_ENDPOINTS.learningPathByLevel(level),
      );
      return getAdminResponseData(response);
    }

    await fakeDelay();
    const path = findPath(level);
    if (!path) throw new Error('Không tìm thấy lộ trình học');
    return clone(path);
  } catch (error) {
    throw getAdminError(error, 'Không thể tải lộ trình học');
  }
}

export async function createLesson(payload) {
  try {
    if (!USE_FAKE_ADMIN) {
      const response = await axiosClient.post(
        ADMIN_ENDPOINTS.lessons,
        payload,
      );
      return getAdminResponseData(response);
    }

    await fakeDelay();
    const path = findPath(payload.level);
    if (!path) throw new Error('Không tìm thấy lộ trình học');

    const now = new Date().toISOString();
    const lesson = {
      ...payload,
      id: Date.now(),
      level: path.level,
      order: Number(payload.order) || path.lessons.length + 1,
      kanjiCount: Number(payload.kanjiCount) || 0,
      vocabularyCount: Number(payload.vocabularyCount) || 0,
      status: payload.status || 'ACTIVE',
      isUnlocked: payload.isUnlocked ?? true,
      createdAt: now,
      updatedAt: now,
    };
    path.lessons.push(lesson);
    syncPath(path);
    return clone(lesson);
  } catch (error) {
    throw getAdminError(error, 'Không thể tạo bài học');
  }
}

export async function updateLesson(lessonId, payload) {
  try {
    if (!USE_FAKE_ADMIN) {
      const response = await axiosClient.put(
        ADMIN_ENDPOINTS.lessonById(lessonId),
        payload,
      );
      return getAdminResponseData(response);
    }

    await fakeDelay();
    const { path, lessonIndex } = findLesson(lessonId);
    const allowedFields = [
      'title',
      'description',
      'order',
      'kanjiCount',
      'vocabularyCount',
      'status',
      'isUnlocked',
    ];
    const updates = Object.fromEntries(
      allowedFields
        .filter((field) => Object.hasOwn(payload, field))
        .map((field) => [field, payload[field]]),
    );

    path.lessons[lessonIndex] = {
      ...path.lessons[lessonIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    const updatedLesson = path.lessons[lessonIndex];
    syncPath(path);
    return clone(updatedLesson);
  } catch (error) {
    throw getAdminError(error, 'Không thể cập nhật bài học');
  }
}

export async function updateLessonStatus(lessonId, payload) {
  try {
    if (!['ACTIVE', 'LOCKED'].includes(payload.status)) {
      throw new Error('Trạng thái bài học chỉ nhận ACTIVE hoặc LOCKED');
    }

    if (!USE_FAKE_ADMIN) {
      const response = await axiosClient.patch(
        ADMIN_ENDPOINTS.lessonStatus(lessonId),
        payload,
      );
      return getAdminResponseData(response);
    }

    await fakeDelay();
    const { path, lessonIndex } = findLesson(lessonId);
    const lesson = path.lessons[lessonIndex];
    lesson.status = payload.status;
    lesson.isUnlocked = payload.status === 'ACTIVE';
    lesson.updatedAt = new Date().toISOString();
    return clone(lesson);
  } catch (error) {
    throw getAdminError(error, 'Không thể cập nhật trạng thái bài học');
  }
}

export async function updateLessonOrder(lessonId, payload) {
  try {
    const order = Number(payload.order);
    if (!Number.isInteger(order) || order < 1) {
      throw new Error('Thứ tự bài học phải là số nguyên lớn hơn 0');
    }

    if (!USE_FAKE_ADMIN) {
      const response = await axiosClient.patch(
        ADMIN_ENDPOINTS.lessonOrder(lessonId),
        { order },
      );
      return getAdminResponseData(response);
    }

    await fakeDelay();
    const { path, lessonIndex } = findLesson(lessonId);
    const lesson = path.lessons[lessonIndex];
    lesson.order = order;
    lesson.updatedAt = new Date().toISOString();
    syncPath(path);
    return clone(lesson);
  } catch (error) {
    throw getAdminError(error, 'Không thể cập nhật thứ tự bài học');
  }
}

export async function deleteLesson(lessonId) {
  try {
    if (!USE_FAKE_ADMIN) {
      const response = await axiosClient.delete(
        ADMIN_ENDPOINTS.lessonById(lessonId),
      );
      return getAdminResponseData(response);
    }

    await fakeDelay();
    const { path, lessonIndex } = findLesson(lessonId);
    const [deletedLesson] = path.lessons.splice(lessonIndex, 1);
    syncPath(path);
    return { id: deletedLesson.id, status: 'DELETED' };
  } catch (error) {
    throw getAdminError(error, 'Không thể xóa bài học');
  }
}

/*
 * Adapter tương thích page cũ: page đang dùng mảng lesson phẳng và tên hàm cũ.
 * Named exports phía trên vẫn giữ contract chuẩn dành cho API tương lai.
 */
const getLegacyLessons = async () => {
  const paths = await getLearningPaths();
  return paths.flatMap((path) => path.lessons);
};

const reorderLegacyLesson = async (lessonId, direction) => {
  const lessons = await getLegacyLessons();
  const current = lessons.find(
    (lesson) => String(lesson.id) === String(lessonId),
  );
  if (!current) throw new Error('Không tìm thấy bài học');

  const sameLevel = lessons
    .filter((lesson) => lesson.level === current.level)
    .sort((left, right) => left.order - right.order);
  const currentIndex = sameLevel.findIndex((lesson) => lesson.id === current.id);
  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= sameLevel.length) return clone(current);

  const target = sameLevel[targetIndex];
  const currentOrder = current.order;
  await updateLessonOrder(current.id, { order: target.order });
  await updateLessonOrder(target.id, { order: currentOrder });
  return getLearningPathByLevel(current.level);
};

const adminLearningPathService = {
  getLearningPaths: getLegacyLessons,
  getLearningPathByLevel,
  createLesson,
  updateLesson,
  updateLessonStatus,
  updateLessonOrder,
  deleteLesson,
  createLearningPath: createLesson,
  updateLearningPath: updateLesson,
  deleteLearningPath: deleteLesson,
  toggleLearningPathStatus: async (lessonId) => {
    const lessons = await getLegacyLessons();
    const lesson = lessons.find(
      (item) => String(item.id) === String(lessonId),
    );
    if (!lesson) throw new Error('Không tìm thấy bài học');
    return updateLessonStatus(lessonId, {
      status: lesson.isUnlocked ? 'LOCKED' : 'ACTIVE',
    });
  },
  reorderLearningPath: reorderLegacyLesson,
};

export default adminLearningPathService;
