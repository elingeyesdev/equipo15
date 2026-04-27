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
        data: this.transform(data) as T,
      })),
    );
  }

  private transform(data: unknown): unknown {
    if (!data || typeof data !== 'object') return data;

    if (Array.isArray(data)) {
      return data.map((item) => this.transform(item));
    }

    const obj = data as Record<string, unknown>;

    if (
      obj instanceof Date ||
      obj._bsontype === 'ObjectID' ||
      (obj.constructor && obj.constructor.name === 'ObjectId')
    ) {
      return obj;
    }

    const transformed =
      typeof obj.toObject === 'function'
        ? (obj.toObject() as Record<string, unknown>)
        : { ...obj };

    if (
      transformed.roleId &&
      typeof transformed.roleId === 'object' &&
      (transformed.roleId as Record<string, unknown>).name
    ) {
      transformed.role = (transformed.roleId as Record<string, unknown>).name;
    }

    Object.keys(transformed).forEach((key) => {
      const val = transformed[key];
      if (val && typeof val === 'object' && key !== 'roleId') {
        if (Array.isArray(val)) {
          transformed[key] = val.map((item) => this.transform(item));
        } else if (val.constructor && val.constructor.name === 'Object') {
          transformed[key] = this.transform(val);
        }
      }
    });

    return transformed;
  }
}
