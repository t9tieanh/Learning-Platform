import { 
  IsString, 
  IsNotEmpty, 
  IsArray, 
  ValidateNested, 
  IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';

// enum PaymentMethod {
//   VNPAY = 'VNPAY',
//   CASH = 'CASH',
// }

// class ReceiverInfoDto {
//   @IsString()
//   @IsNotEmpty()
//   name: string | undefined;

//   @IsPhoneNumber('VN')
//   phone: string | undefined;

//   @IsString()
//   @IsNotEmpty()
//   address: string | undefined;
// }

class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  courseId: string | undefined;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[] | undefined;
}

export class ApplyDiscountDto {
  @IsString()
  @IsNotEmpty()
  discountCode: string | undefined;
}

export class CreatePaymentUrlDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string | undefined;
}