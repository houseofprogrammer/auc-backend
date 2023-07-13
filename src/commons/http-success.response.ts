import { HttpStatus } from '@nestjs/common';

export interface ResponseData {
  status: HttpStatus;
  error: boolean;
  data: any;
}

export function GenericSuccessResponse(
  data: any,
  status = HttpStatus.OK,
): ResponseData {
  return {
    status: status,
    error: false,
    data: data,
  };
}
