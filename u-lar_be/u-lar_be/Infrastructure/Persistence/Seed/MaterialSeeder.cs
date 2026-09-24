using Microsoft.EntityFrameworkCore;
using u_lar_be.Domain.Materials;

namespace u_lar_be.Infrastructure.Persistence.Seed;

/// <summary>
/// Isi awal Bank Materi. Hanya jalan saat tabel materials masih kosong supaya
/// materi yang sudah diubah/ditambah admin tidak pernah ditimpa saat restart.
/// </summary>
public static class MaterialSeeder
{
    public static async Task SeedAsync(
        AppDbContext dbContext,
        CancellationToken cancellationToken = default)
    {
        if (await dbContext.Materials.AnyAsync(cancellationToken))
        {
            return;
        }

        dbContext.Materials.AddRange(
            BuildStraightMaterial(),
            BuildCrossoverMaterial(),
            BuildUtpMaterial());

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static Material BuildStraightMaterial() => new()
    {
        Slug = "straight",
        ModuleCode = "MODUL 01",
        Title = "Kabel Straight",
        Subtitle = "Susunan T568B untuk menghubungkan perangkat berbeda jenis",
        ReadMinutes = 4,
        OrderNumber = 1,
        KeyPoints =
        [
            new MaterialKeyPoint
            {
                Icon = "wire",
                Text = "Urutan **T568B**: putih-oranye, oranye, putih-hijau, biru, putih-biru, hijau, putih-cokelat, cokelat."
            },
            new MaterialKeyPoint
            {
                Icon = "check",
                Text = "Kedua ujung kabel memakai urutan warna yang **sama persis**."
            },
            new MaterialKeyPoint
            {
                Icon = "plug",
                Text = "Dipakai untuk perangkat **berbeda jenis**: PC ke switch, modem ke router, atau router ke switch."
            },
            new MaterialKeyPoint
            {
                Icon = "target",
                Text = "Pilihan utama untuk jaringan bertopologi **bintang (star)** di lab sekolah."
            }
        ],
        Callouts =
        [
            new MaterialCallout
            {
                Tone = "formula",
                Label = "Rumus cepat",
                Body = "Ujung A = Ujung B, maka kabel itu **straight**."
            },
            new MaterialCallout
            {
                Tone = "warn",
                Label = "Sering keliru",
                Body = "Kabel straight tidak bisa menghubungkan dua PC langsung tanpa switch - itu tugas kabel **cross-over**."
            },
            new MaterialCallout
            {
                Tone = "tip",
                Label = "Saat praktik",
                Body = "Uji dengan **LAN tester**; lampu 1-8 harus menyala berurutan di kedua ujung."
            }
        ],
        Diagrams =
        [
            new MaterialDiagram
            {
                Caption = "Urutan pin T568B pada konektor RJ-45"
            }
        ],
        Accordion =
        [
            new MaterialAccordionItem
            {
                Title = "Kenapa urutan warna penting?",
                Body = "Pasangan kabel sengaja dililit dengan rasio berbeda untuk meredam interferensi. Kalau urutan ditukar bukan pada pasangannya, lilitan tidak lagi bekerja dan sinyal mudah terganggu, terutama pada Gigabit Ethernet."
            },
            new MaterialAccordionItem
            {
                Title = "Apa bedanya T568A dan T568B?",
                Body = "Keduanya sama-sama straight; bedanya hanya posisi pasangan hijau dan oranye. T568B lebih umum dipakai di Indonesia. Selama kedua ujung konsisten, kabel tetap berfungsi."
            },
            new MaterialAccordionItem
            {
                Title = "Kapan kabel straight gagal?",
                Body = "Umumnya karena panjang melebihi 100 meter, konektor tidak ter-crimp sempurna, atau urutan di kedua ujung ternyata berbeda."
            },
            new MaterialAccordionItem
            {
                Title = "Glosarium: UTP",
                Body = "Unshielded Twisted Pair - kabel empat pasang tanpa pelindung logam. Murah dan paling banyak dipakai di jaringan sekolah."
            },
            new MaterialAccordionItem
            {
                Title = "Glosarium: RJ-45",
                Body = "Konektor 8 pin yang dipasang di ujung kabel UTP. Sekali ter-crimp, konektor tidak bisa dipakai ulang."
            },
            new MaterialAccordionItem
            {
                Title = "Glosarium: Crimping",
                Body = "Menekan konektor RJ-45 dengan tang crimp agar pin menusuk inti kabel. Kekuatan tekanan menentukan kualitas koneksi."
            }
        ]
    };

    private static Material BuildCrossoverMaterial() => new()
    {
        Slug = "crossover",
        ModuleCode = "MODUL 02",
        Title = "Kabel Cross-over",
        Subtitle = "Menghubungkan dua perangkat sejenis secara langsung",
        ReadMinutes = 4,
        OrderNumber = 2,
        KeyPoints =
        [
            new MaterialKeyPoint
            {
                Icon = "wire",
                Text = "Ujung A memakai **T568B**, ujung B memakai **T568A**."
            },
            new MaterialKeyPoint
            {
                Icon = "check",
                Text = "Pasangan oranye dan hijau **bertukar posisi** di antara kedua ujung."
            },
            new MaterialKeyPoint
            {
                Icon = "plug",
                Text = "Dipakai untuk PC ke PC, switch ke switch, atau router ke router pada port biasa."
            },
            new MaterialKeyPoint
            {
                Icon = "target",
                Text = "Sejak **Auto-MDIX** ada di perangkat modern, kebutuhan cross-over makin jarang."
            }
        ],
        Callouts =
        [
            new MaterialCallout
            {
                Tone = "formula",
                Label = "Rumus cepat",
                Body = "Ujung A tidak sama dengan Ujung B, maka kabel itu **cross-over**."
            },
            new MaterialCallout
            {
                Tone = "info",
                Label = "Pin yang bertukar",
                Body = "Pin **1-3** dan **2-6**: putih-oranye bertukar dengan putih-hijau, oranye bertukar dengan hijau."
            },
            new MaterialCallout
            {
                Tone = "tip",
                Label = "Saat praktik",
                Body = "Perangkat modern mendeteksi otomatis, tetapi urutan tetap wajib dihafal untuk ujian praktik."
            }
        ],
        Diagrams =
        [
            new MaterialDiagram
            {
                Caption = "Pertukaran pin 1-3 dan 2-6 pada konektor RJ-45"
            }
        ],
        Accordion =
        [
            new MaterialAccordionItem
            {
                Title = "Kenapa harus ada kabel cross-over?",
                Body = "Port jaringan punya jalur kirim (TX) dan terima (RX). Pada perangkat sejenis, TX di satu sisi harus bertemu RX di sisi lain - itulah yang dilakukan pertukaran pin."
            },
            new MaterialAccordionItem
            {
                Title = "Apa itu Auto-MDIX?",
                Body = "Fitur pada switch dan NIC modern yang mendeteksi otomatis jenis kabel dan membalik jalur TX/RX secara internal, sehingga kabel straight pun bisa dipakai."
            },
            new MaterialAccordionItem
            {
                Title = "Apakah cross-over masih dipakai?",
                Body = "Untuk perangkat lama dan praktik laboratorium, ya. Di jaringan produksi modern, fungsi ini sudah diambil alih Auto-MDIX."
            },
            new MaterialAccordionItem
            {
                Title = "Glosarium: MDI / MDI-X",
                Body = "Penamaan port jaringan: MDI (perangkat akhir) dan MDI-X (switch/hub). Cross-over pada dasarnya menghubungkan MDI ke MDI."
            },
            new MaterialAccordionItem
            {
                Title = "Glosarium: Gigabit Ethernet",
                Body = "Ethernet 1000 Mbps yang memakai keempat pasang kabel sekaligus, sehingga kesalahan urutan lebih mudah terdeteksi."
            }
        ]
    };

    private static Material BuildUtpMaterial() => new()
    {
        Slug = "utp",
        ModuleCode = "MODUL 03",
        Title = "Dasar Kabel UTP",
        Subtitle = "Bagian, kategori, dan batas panjang kabel jaringan",
        ReadMinutes = 5,
        OrderNumber = 3,
        KeyPoints =
        [
            new MaterialKeyPoint
            {
                Icon = "wire",
                Text = "Terdiri dari **4 pasang** kabel yang saling dililit, masing-masing satu warna dan satu putihnya."
            },
            new MaterialKeyPoint
            {
                Icon = "check",
                Text = "Lilitan berfungsi menekan **interferensi elektromagnetik** dari luar."
            },
            new MaterialKeyPoint
            {
                Icon = "plug",
                Text = "Kategori umum: **Cat5e** (1 Gbps, 100 m) dan **Cat6** (10 Gbps, 55 m)."
            },
            new MaterialKeyPoint
            {
                Icon = "target",
                Text = "Batas panjang satu ruas kabel adalah **100 meter**."
            }
        ],
        Callouts =
        [
            new MaterialCallout
            {
                Tone = "formula",
                Label = "Batas panjang",
                Body = "1 ruas = **100 m** = 90 m kabel tetap + 10 m kabel patch."
            },
            new MaterialCallout
            {
                Tone = "warn",
                Label = "Sering keliru",
                Body = "Melebihi 100 meter membuat sinyal melemah dan paket hilang - gejalanya koneksi lambat, bukan langsung putus."
            },
            new MaterialCallout
            {
                Tone = "tip",
                Label = "Saat praktik",
                Body = "Kupas kulit luar **3-4 cm** saja; kupasan terlalu panjang melemahkan konektor."
            }
        ],
        Diagrams =
        [
            new MaterialDiagram
            {
                Caption = "Potongan kabel UTP dan urutan lapisan pelindungnya"
            }
        ],
        Accordion =
        [
            new MaterialAccordionItem
            {
                Title = "Apa arti 'twisted pair'?",
                Body = "Dua kabel dalam satu pasangan dililit sepanjang kabel. Lilitan ini membuat gangguan yang masuk ke satu kabel juga masuk ke pasangannya dengan arah berlawanan, lalu saling meniadakan."
            },
            new MaterialAccordionItem
            {
                Title = "Apa bedanya UTP, STP, dan FTP?",
                Body = "UTP tanpa pelindung logam, STP memakai pelindung per pasangan, FTP memakai satu foil untuk seluruh kabel. Makin terlindungi, makin mahal dan makin kaku."
            },
            new MaterialAccordionItem
            {
                Title = "Kenapa urutan warna T568B populer?",
                Body = "Standar ini meletakkan pasangan oranye pada pin 1-2 dan hijau pada 3-6, pola yang paling mudah dihafal pemula dan dipakai luas di Indonesia."
            },
            new MaterialAccordionItem
            {
                Title = "Glosarium: Cat5e",
                Body = "Kategori kabel yang mendukung 1 Gbps sampai 100 meter. Huruf 'e' berarti enhanced - lebih baik meredam crosstalk daripada Cat5."
            },
            new MaterialAccordionItem
            {
                Title = "Glosarium: Crosstalk",
                Body = "Gangguan dari kabel di sebelahnya. Dilawan dengan memperbesar jumlah lilitan per satuan panjang."
            }
        ]
    };
}
