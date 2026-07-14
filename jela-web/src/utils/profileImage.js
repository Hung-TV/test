import { PROFILE_IMAGE_RULES } from '../constants/profileConstants';

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Không thể đọc tệp ảnh đã chọn.'));
    };

    image.src = objectUrl;
  });

export const prepareProfileImage = async (file) => {
  if (!PROFILE_IMAGE_RULES.acceptedTypes.includes(file.type)) {
    throw new Error('Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP.');
  }

  if (file.size > PROFILE_IMAGE_RULES.maxFileSize) {
    throw new Error('Ảnh đại diện không được vượt quá 2 MB.');
  }

  const image = await loadImage(file);
  const sourceSize = Math.min(image.width, image.height);
  const sourceX = Math.max(0, (image.width - sourceSize) / 2);
  const sourceY = Math.max(0, (image.height - sourceSize) / 2);
  const outputSize = Math.min(PROFILE_IMAGE_RULES.maxDimension, sourceSize);
  const canvas = document.createElement('canvas');

  // Avatar luôn được crop vuông từ chính giữa ảnh. Điều này giúp cùng một dữ
  // liệu hiển thị ổn định ở Profile, Header và mọi component avatar khác.
  canvas.width = Math.max(1, Math.round(outputSize));
  canvas.height = Math.max(1, Math.round(outputSize));

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Trình duyệt không hỗ trợ xử lý ảnh đại diện.');
  }

  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceSize,
    sourceSize,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  // Dùng WebP giúp ảnh lưu trong localStorage nhỏ hơn đáng kể so với ảnh gốc.
  return canvas.toDataURL('image/webp', 0.86);
};
