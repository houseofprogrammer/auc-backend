import { HttpStatus } from '@nestjs/common';

export function GenericSuccessResponse(data: any, status = HttpStatus.OK) {
  return {
    status: status,
    error: false,
    data: data,
  };
}
