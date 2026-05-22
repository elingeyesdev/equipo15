import { Module, forwardRef } from '@nestjs/common';
import { UsersController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { IsAllowedDomainConstraint } from '../../common/validators/is-allowed-domain.validator';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [forwardRef(() => AdminModule)],
  controllers: [UsersController],
  providers: [UserService, UserRepository, IsAllowedDomainConstraint],
  exports: [UserService, UserRepository],
})
export class UserModule {}
