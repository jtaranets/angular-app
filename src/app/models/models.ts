export interface AuthResponseModel {
  auth: boolean;
  token: string;
}

export interface ImageResponse {
  hasMore: boolean;
  page: number;
  pageCount: number;
  pictures: Image[];
}

export interface Image {
  id: string;
  cropped_picture: string;
}

export interface SingleImageResponse {
  author: string;
  camera: string;
  cropped_picture: string;
  full_picture: string;
  id: string;
  tags: string;
}
