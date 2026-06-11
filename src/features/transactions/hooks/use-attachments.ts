import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { pendoTrack } from "@/lib/pendo";
import {
  createAttachment,
  deleteAttachment,
  getAttachmentsByTransactionId,
} from "@/lib/db/repositories/attachments.repo";
import type { Attachment } from "@/types";

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB per file
export const MAX_FILES_PER_TRANSACTION = 5;

export interface StagedFile {
  id: string;
  file: File;
}

export interface UseAttachmentsReturn {
  /** Persisted attachments (existing transaction). */
  attachments: Attachment[];
  /** Files held in memory until the transaction is created. */
  stagedFiles: StagedFile[];
  totalCount: number;
  addFiles: (files: FileList | File[]) => Promise<void>;
  removeAttachment: (id: string) => Promise<void>;
  removeStagedFile: (id: string) => void;
  /** Persist staged files once the new transaction has an id. */
  flushStaged: (transactionId: string) => Promise<void>;
  /** Drop staged files (e.g. the add dialog was cancelled). */
  reset: () => void;
  reload: () => Promise<void>;
}

function validateFile(file: File, currentCount: number): string | null {
  if (currentCount >= MAX_FILES_PER_TRANSACTION) {
    return `Maximum ${MAX_FILES_PER_TRANSACTION} attachments per transaction`;
  }
  if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
    return `${file.name}: only images and PDFs are supported`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `${file.name}: file is larger than 5 MB`;
  }
  return null;
}

export function useAttachments(workspaceId: string, transactionId: string | null): UseAttachmentsReturn {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);

  const reload = useCallback(async () => {
    if (!transactionId) {
      setAttachments([]);
      return;
    }
    setAttachments(await getAttachmentsByTransactionId(transactionId));
  }, [transactionId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const totalCount = attachments.length + stagedFiles.length;

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      let count = totalCount;
      for (const file of Array.from(files)) {
        const error = validateFile(file, count);
        if (error) {
          toast.error(error);
          continue;
        }
        count++;
        if (transactionId) {
          await createAttachment({
            id: crypto.randomUUID(),
            workspaceId,
            transactionId,
            name: file.name,
            mimeType: file.type,
            size: file.size,
            blob: file,
            createdAt: new Date().toISOString(),
          });
        } else {
          setStagedFiles((prev) => [...prev, { id: crypto.randomUUID(), file }]);
        }
      }
      if (transactionId) await reload();
      const added = count - totalCount;
      if (added > 0) {
        const mimeTypes = Array.from(files).map((f) => f.type).filter(Boolean);
        const totalSize = Array.from(files).reduce((sum, f) => sum + f.size, 0);
        pendoTrack("attachment_uploaded", {
          fileCount: added,
          fileMimeTypes: [...new Set(mimeTypes)].join(","),
          totalFileSize: totalSize,
          transactionId: transactionId ?? "staged",
        });
      }
    },
    [workspaceId, transactionId, totalCount, reload]
  );

  const removeAttachment = useCallback(
    async (id: string) => {
      await deleteAttachment(id);
      await reload();
    },
    [reload]
  );

  const removeStagedFile = useCallback((id: string) => {
    setStagedFiles((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const flushStaged = useCallback(
    async (newTransactionId: string) => {
      for (const staged of stagedFiles) {
        await createAttachment({
          id: staged.id,
          workspaceId,
          transactionId: newTransactionId,
          name: staged.file.name,
          mimeType: staged.file.type,
          size: staged.file.size,
          blob: staged.file,
          createdAt: new Date().toISOString(),
        });
      }
      setStagedFiles([]);
    },
    [workspaceId, stagedFiles]
  );

  const reset = useCallback(() => setStagedFiles([]), []);

  return {
    attachments,
    stagedFiles,
    totalCount,
    addFiles,
    removeAttachment,
    removeStagedFile,
    flushStaged,
    reset,
    reload,
  };
}
