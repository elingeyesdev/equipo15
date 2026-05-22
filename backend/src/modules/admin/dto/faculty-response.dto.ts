export class FacultyResponseDto {
  id: string;
  name: string;
  institutionId?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
