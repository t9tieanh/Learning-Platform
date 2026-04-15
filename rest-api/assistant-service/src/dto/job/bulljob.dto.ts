import { Job } from 'bull';

/**
 * Type alias for Bull Job with proper generic typing
 * 
 * Usage: BullJobDTO<JobDataType> = Job<JobDataType>
 */
export type BullJobDTO<T> = Job<T>;
