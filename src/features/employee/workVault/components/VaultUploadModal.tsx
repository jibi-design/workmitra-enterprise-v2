// App: Job Mitra / WorkMitra_Enterprise_v2
// File: VaultUploadModal.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workVault\components\VaultUploadModal.tsx

import { useRef, useState } from "react";
import { CenterModal } from "../../../../shared/components/CenterModal";
import { ALLOWED_FILE_TYPES } from "../constants/vaultConstants";
import { validateDocumentName, validateFile } from "../helpers/vaultValidation";
import type { VaultFileType } from "../types/vaultTypes";
import { VaultUploadForm } from "./uploadModal/VaultUploadForm";

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("File read failed."));
    reader.readAsDataURL(file);
  });
}

function generateThumbnail(base64: string, maxSize: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);

      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.6));
      } else {
        resolve("");
      }
    };

    img.onerror = () => resolve("");
    img.src = base64;
  });
}

function detectFileType(file: File): VaultFileType {
  return file.type === "application/pdf" ? "pdf" : "image";
}

type VaultUploadModalProps = {
  open: boolean;
  onClose: () => void;
  onUpload: (data: {
    name: string;
    fileType: VaultFileType;
    base64Data: string;
    thumbnailBase64: string;
    expiryDate: string | null;
  }) => void;
};

export function VaultUploadModal({ open, onClose, onUpload }: VaultUploadModalProps) {
  const [name, setName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function resetForm() {
    setName("");
    setExpiryDate("");
    setSelectedFile(null);
    setFileName("");
    setError("");
    setUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleFilePick(file: File | null) {
    if (!file) return;

    const validation = validateFile(file);

    if (!validation.valid) {
      setError(validation.reason);
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);
    setError("");

    if (!name.trim()) {
      const baseName = file.name.replace(/\.[^.]+$/, "").replace(/[_-]/g, " ");
      setName(baseName);
    }
  }

  async function handleUpload() {
    const nameCheck = validateDocumentName(name);

    if (!nameCheck.valid) {
      setError(nameCheck.reason);
      return;
    }

    if (!selectedFile) {
      setError("Please select a file to upload.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const base64Data = await readFileAsBase64(selectedFile);
      const fileType = detectFileType(selectedFile);

      let thumbnailBase64 = "";

      if (fileType === "image") {
        thumbnailBase64 = await generateThumbnail(base64Data, 120);
      }

      onUpload({
        name: name.trim(),
        fileType,
        base64Data,
        thumbnailBase64,
        expiryDate: expiryDate.trim() || null,
      });

      resetForm();
    } catch {
      setError("Failed to read the file. Please try again.");
      setUploading(false);
    }
  }

  const acceptTypes = ALLOWED_FILE_TYPES.join(",");

  return (
    <CenterModal open={open} onBackdropClose={handleClose} ariaLabel="Upload document">
      <VaultUploadForm
        name={name}
        expiryDate={expiryDate}
        fileName={fileName}
        error={error}
        uploading={uploading}
        acceptTypes={acceptTypes}
        fileInputRef={fileInputRef}
        onNameChange={(value) => {
          setName(value);

          if (error) {
            setError("");
          }
        }}
        onExpiryDateChange={setExpiryDate}
        onFilePick={handleFilePick}
        onClose={handleClose}
        onUpload={() => void handleUpload()}
      />
    </CenterModal>
  );
}
