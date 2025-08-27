import { Expose } from "class-transformer";

export class SessionResponseDto {
  @Expose() id: string;
  @Expose() userAgent?: string;
  @Expose() ip?: string;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;
}
