import { VALIDATION } from "../../config/validation";
import type {
  MaterialDetail,
  SaveMaterialRequest,
} from "../../types/materialBank";
import type {
  AccordionBlock,
  CalloutBlock,
  DiagramBlock,
  DraftProblem,
  KeyPointBlock,
  MaterialDraft,
} from "../../types/materialEditor";

const rules = VALIDATION.material;

/** Nomor urut kunci blok. Hanya untuk React, jadi cukup naik terus. */
let blockSequence = 0;

function nextBlockKey(): number {
  blockSequence += 1;
  return blockSequence;
}

export function createKeyPointBlock(icon = "check"): KeyPointBlock {
  return { key: nextBlockKey(), icon, text: "" };
}

export function createCalloutBlock(): CalloutBlock {
  return { key: nextBlockKey(), tone: "info", label: "", body: "" };
}

export function createDiagramBlock(): DiagramBlock {
  return { key: nextBlockKey(), imageUrl: "", caption: "" };
}

export function createAccordionBlock(): AccordionBlock {
  return { key: nextBlockKey(), title: "", body: "" };
}

/** Materi baru dibuka dengan satu poin penting siap ditulis supaya canvas
 * tidak terasa hampa. */
export function createEmptyDraft(): MaterialDraft {
  return {
    title: "",
    subtitle: "",
    moduleCode: "",
    readMinutes: String(rules.readMinutes.default),
    orderNumber: "1",
    keyPoints: [createKeyPointBlock()],
    callouts: [],
    diagrams: [],
    accordion: [],
  };
}

export function draftFromDetail(detail: MaterialDetail): MaterialDraft {
  return {
    title: detail.title,
    subtitle: detail.subtitle,
    moduleCode: detail.moduleCode,
    readMinutes: String(detail.readMinutes),
    orderNumber: String(detail.orderNumber),
    keyPoints: detail.keyPoints.map((item) => ({
      key: nextBlockKey(),
      icon: item.icon,
      text: item.text,
    })),
    callouts: detail.callouts.map((item) => ({
      key: nextBlockKey(),
      tone: item.tone,
      label: item.label,
      body: item.body,
    })),
    diagrams: detail.diagrams.map((item) => ({
      key: nextBlockKey(),
      imageUrl: item.imageUrl ?? "",
      caption: item.caption,
    })),
    accordion: detail.accordion.map((item) => ({
      key: nextBlockKey(),
      title: item.title,
      body: item.body,
    })),
  };
}

/* Blok yang seluruh isiannya masih kosong dianggap "belum diisi", bukan
   "salah isi": blok begitu dibuang saat menyimpan supaya admin tidak perlu
   menghapus blok yang tidak sengaja ditambahkan. */
function isKeyPointEmpty(block: KeyPointBlock): boolean {
  return block.text.trim() === "";
}

function isCalloutEmpty(block: CalloutBlock): boolean {
  return block.label.trim() === "" && block.body.trim() === "";
}

function isDiagramEmpty(block: DiagramBlock): boolean {
  return block.imageUrl.trim() === "" && block.caption.trim() === "";
}

function isAccordionEmpty(block: AccordionBlock): boolean {
  return block.title.trim() === "" && block.body.trim() === "";
}

/** Membuang blok kosong dari draft yang sedang ditampilkan. */
export function pruneEmptyDraft(draft: MaterialDraft): MaterialDraft {
  return {
    ...draft,
    keyPoints: draft.keyPoints.filter((block) => !isKeyPointEmpty(block)),
    callouts: draft.callouts.filter((block) => !isCalloutEmpty(block)),
    diagrams: draft.diagrams.filter((block) => !isDiagramEmpty(block)),
    accordion: draft.accordion.filter((block) => !isAccordionEmpty(block)),
  };
}

/** Mengubah draft jadi request API. Blok kosong dibuang lebih dulu. */
export function draftToSaveRequest(draft: MaterialDraft): SaveMaterialRequest {
  const pruned = pruneEmptyDraft(draft);

  return {
    moduleCode: pruned.moduleCode.trim(),
    title: pruned.title.trim(),
    subtitle: pruned.subtitle.trim(),
    readMinutes: Number(pruned.readMinutes),
    orderNumber: Number(pruned.orderNumber),
    keyPoints: pruned.keyPoints.map((block) => ({
      icon: block.icon,
      text: block.text.trim(),
    })),
    callouts: pruned.callouts.map((block) => ({
      tone: block.tone,
      label: block.label.trim(),
      body: block.body.trim(),
    })),
    diagrams: pruned.diagrams.map((block) => ({
      imageUrl: block.imageUrl.trim(),
      caption: block.caption.trim(),
    })),
    accordion: pruned.accordion.map((block) => ({
      title: block.title.trim(),
      body: block.body.trim(),
    })),
  };
}

/** Isian yang belum lolos aturan server, siap ditampilkan sebagai penanda di
 * layar. Blok yang seluruhnya kosong tidak dihitung karena akan dibuang. */
export function validateDraft(draft: MaterialDraft): DraftProblem[] {
  const problems: DraftProblem[] = [];

  if (draft.title.trim() === "") {
    problems.push({ target: "title", message: "Judul materi wajib diisi." });
  }

  if (draft.subtitle.trim() === "") {
    problems.push({
      target: "subtitle",
      message: "Deskripsi singkat wajib diisi.",
    });
  }

  if (draft.moduleCode.trim() === "") {
    problems.push({ target: "moduleCode", message: "Kode modul wajib diisi." });
  }

  const readMinutes = Number(draft.readMinutes);

  if (
    !Number.isInteger(readMinutes) ||
    readMinutes < rules.readMinutes.min ||
    readMinutes > rules.readMinutes.max
  ) {
    problems.push({
      target: "readMinutes",
      message: `Estimasi waktu baca harus angka ${rules.readMinutes.min}-${rules.readMinutes.max} menit.`,
    });
  }

  const orderNumber = Number(draft.orderNumber);

  if (!Number.isInteger(orderNumber) || orderNumber < 0) {
    problems.push({
      target: "orderNumber",
      message: "Urutan tampil harus angka 0 atau lebih.",
    });
  }

  draft.callouts.forEach((block) => {
    if (isCalloutEmpty(block)) {
      return;
    }

    // Blok sudah terisi sebagian, jadi sisi yang masih kosong wajib dilengkapi.
    // Pesannya dipisah agar admin tahu persis field mana yang kurang.
    if (block.label.trim() === "") {
      problems.push({
        target: `co:${block.key}`,
        message: "Judul catatan kunci harus diisi.",
      });
    }

    if (block.body.trim() === "") {
      problems.push({
        target: `co:${block.key}`,
        message: "Isi catatan kunci harus diisi.",
      });
    }
  });

  draft.diagrams.forEach((block) => {
    if (isDiagramEmpty(block)) {
      return;
    }

    if (block.imageUrl.trim() === "") {
      problems.push({
        target: `dg:${block.key}`,
        message: "Gambar diagram belum diunggah.",
      });
    }
  });

  draft.accordion.forEach((block) => {
    if (isAccordionEmpty(block)) {
      return;
    }

    // Pesannya dipisah agar admin tahu persis field mana yang kurang.
    if (block.title.trim() === "") {
      problems.push({
        target: `ac:${block.key}`,
        message: "Judul materi tambahan harus diisi.",
      });
    }

    if (block.body.trim() === "") {
      problems.push({
        target: `ac:${block.key}`,
        message: "Isi materi tambahan harus diisi.",
      });
    }
  });

  return problems;
}

/** Pesan masalah untuk satu field atau blok; kosong berarti sudah benar. */
export function problemFor(
  problems: DraftProblem[],
  target: string
): string {
  return problems.find((problem) => problem.target === target)?.message ?? "";
}

/* ---------- Operasi daftar blok (dipakai canvas) ---------- */

/** Mengubah satu blok berdasarkan key-nya, urutan lain tidak tersentuh. */
export function patchBlock<T extends { key: number }>(
  blocks: T[],
  key: number,
  patch: Partial<T>
): T[] {
  return blocks.map((block) =>
    block.key === key ? { ...block, ...patch } : block
  );
}

export function removeBlock<T extends { key: number }>(
  blocks: T[],
  key: number
): T[] {
  return blocks.filter((block) => block.key !== key);
}

/** Memindahkan blok satu langkah ke atas (-1) atau ke bawah (+1). */
export function moveBlock<T extends { key: number }>(
  blocks: T[],
  key: number,
  direction: -1 | 1
): T[] {
  const index = blocks.findIndex((block) => block.key === key);
  const target = index + direction;

  if (index === -1 || target < 0 || target >= blocks.length) {
    return blocks;
  }

  const next = [...blocks];
  const [moved] = next.splice(index, 1);

  next.splice(target, 0, moved);

  return next;
}
