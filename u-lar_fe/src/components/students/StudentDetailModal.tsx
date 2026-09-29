import { useEffect, useState } from "react";
import { getStudentDetail } from "../../services/studentApi";
import { describeApiError } from "../../services/apiError";
import { useToast } from "../common/toastContext";
import type { StudentDetail } from "../../types/student";
import Modal from "../ui/Modal";

interface StudentDetailModalProps {
  open: boolean;
  onClose: () => void;
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
    />
  );
}

interface DetailContentProps {
  studentId: number;
  onClose: () => void;
}

function DetailContent({ studentId, onClose }: DetailContentProps) {
  const [detail, setDetail] = useState<StudentDetail | null>(null);
  const [error, setError] = useState("");
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
        if (!cancelled) {
          const message = describeApiError(
            "StudentDetailModal",
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

  return (
    <>
      <Modal
        open
        onClose={onClose}
        title="Detail Mahasiswa"
        description={detail ? detail.nim : undefined}
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
    </>
  );
}
