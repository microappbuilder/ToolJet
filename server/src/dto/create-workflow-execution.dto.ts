import { IsString, IsNotEmpty } from 'class-validator';

export class CreateWorkflowExecutionDto {
  @IsString()
  @IsNotEmpty()
  appVersionId: string;
}