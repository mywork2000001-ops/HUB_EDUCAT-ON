-- Partial unique indexes for assignments table.
-- Run this once in Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Standard @@unique is unusable here because PostgreSQL treats NULL != NULL
-- in unique constraints, so nullable columns need partial indexes.

-- 1. Class-level assignment (no group, no student)
CREATE UNIQUE INDEX IF NOT EXISTS uq_assignment_class_item
  ON assignments (class_name, item_id)
  WHERE group_name IS NULL AND student_id IS NULL;

-- 2. Group-level assignment
CREATE UNIQUE INDEX IF NOT EXISTS uq_assignment_group_item
  ON assignments (class_name, group_name, item_id)
  WHERE student_id IS NULL;

-- 3. Student-level assignment
CREATE UNIQUE INDEX IF NOT EXISTS uq_assignment_student_item
  ON assignments (student_id, item_id)
  WHERE class_name IS NULL;
