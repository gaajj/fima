import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FileType } from './file-type.entity';
import { FieldKind } from './field-kind.entity';

@Entity('file_type_fields')
@Index(['type', 'name'], { unique: true })
export class FileTypeField {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => FileType, (t) => t.fields, { onDelete: 'CASCADE' })
  type: FileType;

  @Column()
  name: string;

  @Column({ type: 'varchar' })
  kind: FieldKind;

  @Column({ default: false })
  required: boolean;

  @Column({ type: 'jsonb', default: {} })
  constraints: Record<string, any>;
}
