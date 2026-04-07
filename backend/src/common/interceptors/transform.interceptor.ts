import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data: this.transform(data),
      })),
    );
  }

  private transform(data: any): any {
    if (!data || typeof data !== 'object') return data;

    if (Array.isArray(data)) {
      return data.map((item) => this.transform(item));
    }

    if (
      data instanceof Date ||
      data._bsontype === 'ObjectID' ||
      data.constructor.name === 'ObjectId'
    ) {
      return data;
    }

    const transformed = data.toObject ? data.toObject() : { ...data };

    if (
      transformed.roleId &&
      typeof transformed.roleId === 'object' &&
      transformed.roleId.name
    ) {
      transformed.role = transformed.roleId.name;
    }

    Object.keys(transformed).forEach((key) => {
      const val = transformed[key];
      if (val && typeof val === 'object' && key !== 'roleId') {
        if (Array.isArray(val)) {
          transformed[key] = val.map((item) => this.transform(item));
        } else if (val.constructor.name === 'Object') {
          transformed[key] = this.transform(val);
        }
      }
    });

    return transformed;
  }
}
