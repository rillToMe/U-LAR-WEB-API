import { useEffect, useState } from "react";
import { getStudentDetail } from "../../services/studentApi";
import type { StudentDetail } from "../../types/student";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import StudentEditModal from "./studentEditModal";

interface StudentDetailModalProps {
  open: boolean;
  onClose: () => void;
  onUpdated?: () => void;
  studentId: number | null;
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between gap-4 py-3">
      <dt className="text-sm text-fg-subtle">{label}</dt>
      <dd className="text-sm font-medium text-fg">{value}</dd>
    </div>
  );
}

export default function StudentDetailModal({
  open,
  onClose,
  onUpdated,
  studentId,
}: StudentDetailModalProps) {
  const [detail, setDetail] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!open || studentId === null) {
      return;
    }

    let cancelled = false;

    setLoading(true);
    setError("");
    setSuccessMessage("");

    getStudentDetail(studentId)
      .then((data) => {
        if (!cancelled) {
          setDetail(data);
        }
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) {
          setError("Gagal mengambil detail mahasiswa.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, studentId]);

  function handleSaved(message: string) {
    setSuccessMessage(message);
    setIsEditOpen(false);
    onUpdated?.();

    if (studentId !== null) {
      getStudentDetail(studentId)
        .then(setDetail)
        .catch((error) => console.error(error));
    }
  }

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Detail Mahasiswa"
        description={detail ? detail.nim : undefined}
        footer={
          detail && (
            <Button
              type="button"
              onClick={() => setIsEditOpen(true)}
            >
              Edit
            </Button>
          )
        }
      >
        {loading && (
          <p className="py-6 text-center text-sm text-fg-subtle">
            Memuat detail mahasiswa...
          </p>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-danger-border bg-danger-surface px-4 py-3">
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        {!loading && !error && detail && (
          <>
            {successMessage && (
              <div
                role="status"
                className="rounded-lg border border-success-border bg-success-surface px-4 py-3"
              >
                <p className="text-sm text-success-fg">
                  {successMessage}
                </p>
              </div>
            )}

            <dl className="divide-y">
              <DetailRow label="Nama" value={detail.name} />
              <DetailRow label="NIM" value={detail.nim} />
              <DetailRow label="Email" value={detail.email} />
              <DetailRow
                label="Status"
                value={detail.isActive ? "Aktif" : "Nonaktif"}
              />
              <DetailRow
                label="Progress"
                value={`${detail.progressPercentage}%`}
              />
              <DetailRow
                label="Misi Selesai"
                value={`${detail.totalMissionCompleted} misi`}
              />
              <DetailRow
                label="Skor Rata-rata"
                value={
                  detail.averageScore === null
                    ? "Belum ada skor"
                    : `${detail.averageScore}`
                }
              />
            </dl>
          </>
        )}
      </Modal>

      <StudentEditModal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSaved={handleSaved}
        student={detail}
      />
    </>
  );
}
