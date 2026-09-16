import { useEffect, useState } from "react";
import { getStudentDetail } from "../../services/studentApi";
import { getApiErrorMessage } from "../../services/apiError";
import { useToast } from "../common/toastContext";
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
    <div className="flex justify-between gap-4 py-3 max-md:flex-col max-md:gap-1">
      <dt className="text-sm text-fg-subtle">{label}</dt>
      <dd className="text-sm font-medium text-fg max-md:min-w-0 max-md:break-words">
        {value}
      </dd>
    </div>
  );
}

export default function StudentDetailModal({
  open,
  onClose,
  onUpdated,
  studentId,
}: StudentDetailModalProps) {
  if (!open || studentId === null) {
    return null;
  }

  // `key` membuat konten detail di-mount ulang setiap kali modal dibuka
  // untuk seorang mahasiswa, sehingga state data/error terreset otomatis
  // tanpa perlu memanggil setState di dalam effect.
  return (
    <DetailContent
      key={studentId}
      studentId={studentId}
      onClose={onClose}
      onUpdated={onUpdated}
    />
  );
}

interface DetailContentProps {
  studentId: number;
  onClose: () => void;
  onUpdated?: () => void;
}

function DetailContent({
  studentId,
  onClose,
  onUpdated,
}: DetailContentProps) {
  const [detail, setDetail] = useState<StudentDetail | null>(null);
  const [error, setError] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const toast = useToast();

  // "Loading" diturunkan dari data: fetch sedang berjalan selama belum ada
  // hasil maupun error, jadi tidak perlu state loading terpisah.
  const loading = detail === null && !error;

  useEffect(() => {
    let cancelled = false;

    getStudentDetail(studentId)
      .then((data) => {
        if (!cancelled) {
          setDetail(data);
        }
      })
      .catch((fetchError) => {
        console.error(fetchError);

        if (!cancelled) {
          const message = getApiErrorMessage(
            fetchError,
            "Gagal mengambil detail mahasiswa."
          );

          setError(message);
          toast.error(message);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [studentId, toast]);

  function handleSaved() {
    setIsEditOpen(false);
    onUpdated?.();

    getStudentDetail(studentId)
      .then(setDetail)
      .catch((fetchError) => console.error(fetchError));
  }

  return (
    <>
      <Modal
        open
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
          <div
            role="alert"
            className="rounded-lg border border-danger-border bg-danger-surface px-4 py-3"
          >
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        {!loading && !error && detail && (
          <>
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

      {isEditOpen && detail !== null && (
        <StudentEditModal
          key={detail.id}
          open
          onClose={() => setIsEditOpen(false)}
          onSaved={handleSaved}
          student={detail}
        />
      )}
    </>
  );
}
