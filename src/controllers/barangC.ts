import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ errorFormat: "pretty" });

export const getAllBarang = async (request: Request, response: Response) => {
    try {
      const allBarang = await prisma.barang.findMany();
  
      return response
        .json({
          status: true,
          data: allBarang,
          message: `Mengambil semua data barang`,
        })
        .status(200);
    } catch (error) {
      return response
        .json({
          status: false,
          message: `There is an error. ${error}`,
        })
        .status(400);
    }
  };

export const addBarang = async (request: Request, response: Response) => {
    try {
      const { nama, category, location,quantity } = request.body;
  
      const newUser = await prisma.barang.create({
        data: { nama,category,location,quantity: parseInt(quantity) },
      });
  
      return response
        .json({
          status: true,
          data: newUser,
          message: `barang berhasil di buat`,
        })
        .status(200);
    } catch (error) {
      return response
        .json({
          status: false,
          message: `There is an error. ${error}`,
        })
        .status(400);
    }
  };

  export const updateBarang = async (request: Request, response: Response) => {
    try {
      const { id_barang } = request.params;
      const { nama, category, location,quantity } = request.body;
  
      const findBarang = await prisma.barang.findFirst({
        where: { id_barang: Number(id_barang) },
      });
      if (!findBarang)
        return response
          .status(200)
          .json({ status: false, message:`User is not found` });
  
      const updateUser = await prisma.barang.update({
        data: {
          nama: nama || findBarang.nama,
          category: category || findBarang.category,
          location: location || findBarang.location,
          quantity: quantity ? Number(quantity) : findBarang.quantity
        },
        where: { id_barang: Number(id_barang) },
      });
    
      return response
        .json({
          status: true,
          message: `barang berhasil diubah`,
          data: updateUser,
        })
        .status(200);
    } catch (error) {
      return response
        .json({
          status: false,
          message: `There is an error. ${error}`,
        })
        .status(400);
    }
  };

  export const getBarang = async (request: Request, response: Response) => {
    try {
        const { id_barang } = request.params;

        const findBarang = await prisma.barang.findUnique({
            where: { id_barang: Number(id_barang) },
        });

        if (!findBarang) {
            return response
                .status(404)
                .json({ status: false, message: `Barang tidak ditemukan` });
        }

        return response
            .json({
                status: true,
                data: findBarang,
                message: `Data barang berhasil diambil`,
            })
            .status(200);
    } catch (error) {
        return response
            .json({
                status: false,
                message: `Terjadi kesalahan. ${error}`,
            })
            .status(400);
    }
};

// PEMINJAMAN BARANG
export const borrowBarang = async (request: Request, response: Response) => {
    try {
        const { id_user, id_barang, borrow_date, return_date } = request.body;
        const qty = 1;

        const findUser = await prisma.user.findFirst({
            where: { id: Number(id_user) },
        });
        if (!findUser) {
            return response.status(200).json({
                status: false,
                message: `User with id: ${id_user} is not found`,
            });
        }

        const findBarang = await prisma.barang.findFirst({
            where: { id_barang: Number(id_barang) },
        });
        if (!findBarang) {
            return response.status(200).json({
                status: false,
                message: `Barang with id: ${id_barang} is not found`,
            });
        }

        const barang = await prisma.barang.findUnique({
            where: { id_barang: Number(id_barang) },
            select: { quantity: true },
        });

        if (!barang || barang.quantity === 0) {
            return response.status(400).json({
                status: false,
                message: "Barang kosong",
            });
        }

        const newBorrow = await prisma.peminjaman.create({
            data: {
                id_user: Number(id_user),
                id_barang: Number(id_barang),
                qty: Number(qty),
                borrow_date: new Date(borrow_date),
                return_date: new Date(return_date),
            },
        });

        const updateBarang = await prisma.barang.update({
            where: {
                id_barang: Number(id_barang),
            },
            data: {
                quantity: {
                    decrement: Number(qty),
                },
            },
        });

        return response.status(200).json({
            status: true,
            data: newBorrow,
            message: "Peminjaman barang berhasil dicatat",
        });
    } catch (error) {
        return response.status(400).json({
            status: false,
            message: `Terjadi kesalahan. ${(error as Error).message}`,
        });
    }
};

// RETURNT BARANG
export const returnBarang = async (request: Request, response: Response) => {
    try {
        const { borrow_id, return_date, status,qty } = request.body;

        const peminjaman = await prisma.peminjaman.findUnique({ 
          where: { 
            id_peminjaman: Number(borrow_id) 
          },
             select: { qty: true,status:true,id_barang:true },
            });;
          if (!peminjaman) 
            { return response.status(404).json({
               status: false, 
               message: "Data peminjaman tidak ditemukan",
               });
              }
              if (peminjaman.status === 'kembali'){
                return response.status(400).json({
                  status: false,
                  message: `Barang sudah dikembalikan dan tidak bisa dikembalikan lagi.`,
                })
              }
        const updatedPeminjaman = await prisma.peminjaman.update({
            where: { id_peminjaman: Number(borrow_id) },
            data: {
                return_date: new Date(return_date),
                status: status,
            },
        })  

        const updateBarang = await prisma.barang.update({
           where: { 
            id_barang: Number(peminjaman.id_barang),
          }, data: { 
            quantity: { 
              increment: peminjaman.qty, 
            }, 
          },
        })

        return response.json({
            status: true,
            data: updatedPeminjaman,
            message: "Pengembalian barang berhasil dicatat",
        }).status(200);
    } catch (error) {
        return response.json({
            status: false,
            message: `Terjadi kesalahan. ${error}`,
        }).status(400);
    }
};


//analisis

// export const analisis = async (req: Request, res: Response) => {
//     try {
//       const {
//         startDate,
//         endDate,
//         groupBy,
//       }: {
//         startDate: string;
//         endDate: string;
//         groupBy: "category" | "location";
//       } = req.body;
  
//       // Validate that groupBy is either 'category' or 'location'
//       if (!["category", "location"].includes(groupBy)) {
//         return res.status(400).json({
//           status: "error",
//           message: 'Invalid groupBy value. Use "category" or "location".',
//         });
//       }
  
//       // Fetch borrowed items within the given period
//       const borrowedItems = await prisma.peminjaman.findMany({
//         where: {
//           return_date: {
//             gte: new Date(startDate),
//             lte: new Date(endDate),
//           },
//         },
//         include: {
//           barang: true, // Include item details
//         },
//       });
  
//       // Group by the selected criteria (category or location)
//       const usageAnalysis = borrowedItems.reduce((acc, borrow) => {
//         const group = borrow.barang[groupBy as "category" | "location"]; // Dynamically group by 'category' or 'location'
  
//         if (!acc[group]) {
//           acc[group] = {
//             group,
//             total_borrowed: 0,
//             total_returned: 0,
//             items_in_use: 0,
//           };
//         }
  
//         acc[group].total_borrowed += borrow.qty;
//         acc[group].total_returned +=
//           borrow.status === "dipinjam" || borrow.status === "telat"
//             ? borrow.qty
//             : 0;
//         acc[group].items_in_use +=
//           borrow.status === "dipinjam"
//             ? borrow.qty
//             : borrow.status === "telat"
//             ? 0
//             : -borrow.qty;
  
//         return acc;
//       }, {} as Record<string, { group: string; total_borrowed: number; total_returned: number; items_in_use: number }>);
  
//       const usageAnalysisArray = Object.values(usageAnalysis);
  
//       return res.status(200).json({
//         status: "success",
//         data: {
//           analysis_period: {
//             start_date: startDate,
//             end_date: endDate,
//           },
//           usage_analysis: usageAnalysisArray,
//         },
//         message: "Successfully generated usage report",
//       });
//     } catch (error) {
//       return res.status(400).json({
//         status: "error",
//         message: `There was an error: ${error}`,
//         error,
//       });
//     }
//   };

export const analisis = async (request: Request, response: Response) => {
    const { start_date, end_date, group_by } = request.body;

    if (!start_date || !end_date || !group_by) {
        return response.status(400).json({
            status: "error",
            message: "Tanggal mulai, tanggal akhir, dan kriteria pengelompokan harus diisi.",
        });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return response.status(400).json({
            status: "error",
            message: "Format tanggal tidak valid.",
        });
    }

    try {
        let usageReport;
        let additionalInfo: Array<{ id_barang: number, [key: string]: any }> = [];

        // Query penggunaan barang berdasarkan kriteria pengelompokan
        if (group_by === 'category') {
            usageReport = await prisma.peminjaman.groupBy({
                by: ['id_barang'],
                where: {
                    borrow_date: {
                        gte: startDate,
                    },
                },
                _count: {
                    id_barang: true,
                },
                _sum: {
                    qty: true,
                },
            });

            // KATEGORY
            const ids = usageReport.map(item => item.id_barang);
            additionalInfo = await prisma.barang.findMany({
                where: {
                    id_barang: { in: ids }
                },
                select: { id_barang: true, category: true }
            });
        } else if (group_by === 'location') {
            usageReport = await prisma.peminjaman.groupBy({
                by: ['id_barang'],
                where: {
                    borrow_date: {
                        gte: startDate,
                    },
                },
                _count: {
                    id_barang: true,
                },
                _sum: {
                    qty: true,
                },
            });

            // LOCATION
            const ids = usageReport.map(item => item.id_barang);
            additionalInfo = await prisma.barang.findMany({
                where: {
                    id_barang: { in: ids }
                },
                select: { id_barang: true, location: true }
            });
        } else {
            return response.status(400).json({
                status: "error",
                message: "Kriteria pengelompokan tidak valid. Gunakan 'category' atau 'location'.",
            });
        }

        //menghitung peminjaman yang sudah dikembalikan dalam periode analisis
        const returnedItems = await prisma.peminjaman.groupBy({
            by: ['id_barang'],
            where: {
                borrow_date: {
                    gte: startDate,
                },
                return_date: {
                    gte: startDate,
                    lte: endDate // Memastikan hanya pengembalian dalam periode analisis yang dihitung
                },
                status: 'kembali' // Pastikan hanya yang statusnya 'kembali'
            },
            _count: {
                id_barang: true,
            },
            _sum: {
                qty: true,
            },
        });

        //menghitung peminjaman yang belum dikembalikan atau dikembalikan setelah periode analisis
        const notReturnedItems = await prisma.peminjaman.groupBy({
            by: ['id_barang'],
            where: {
                borrow_date: {
                    gte: startDate,
                },
                OR: [
                    {
                        return_date: {
                            gt: endDate
                        }
                    },
                    {
                        return_date: {
                            equals: new Date(0)
                        }
                    },
                    {
                        status: 'dipinjam'
                    }
                ]
            },
            _count: {
                id_barang: true,
            },
            _sum: {
                qty: true,
            },
        });

        // Menyusun hasil analisis untuk respons
        const usageAnalysis = usageReport.map(item => {
            const info = additionalInfo.find(info => info.id_barang === item.id_barang);
            const returnedItem = returnedItems.find(returned => returned.id_barang === item.id_barang);
            const totalReturned = returnedItem?._count?.id_barang ?? 0; // Jika _count id_barang null, gunakan 0
            const itemsInUse = item._count.id_barang - totalReturned;
            return {
                group: info ? info[group_by as keyof typeof info] : 'Unknown',
                total_borrowed: item._count.id_barang,
                total_returned: totalReturned,
                items_in_use: itemsInUse
            };
        });

        response.status(200).json({
            status: "success",
            data: {
                analysis_period: {
                    start_date: startDate.toISOString().split('T')[0],
                    end_date: endDate.toISOString().split('T')[0]
                },
                usage_analysis: usageAnalysis
            },
            message: "Laporan penggunaan barang berhasil dihasilkan.",
        });
    } catch (error) {
        response.status(500).json({
            status: "error",
            message: `Terjadi kesalahan. ${(error as Error).message}`,
        });
    }
};



  //BorrowAnalysis
  export const borrowAnalysis = async (request: Request, response: Response) => {
      const { start_date, end_date } = request.body;
  
      // Validasi input
      if (!start_date || !end_date) {
          return response.status(400).json({
              status: "error",
              message: "Tanggal mulai dan tanggal akhir harus diisi.",
          });
      }
  
      // Validasi format tanggal
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
  
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return response.status(400).json({
              status: "error",
              message: "Format tanggal tidak valid.",
          });
      }
  
      try {
          // Query untuk mendapatkan barang paling sering dipinjam
          const frequentlyBorrowedItems = await prisma.peminjaman.groupBy({
              by: ['id_barang'],
              where: {
                  borrow_date: {
                      gte: startDate,
                  },
                  return_date: {
                      lte: endDate,
                  },
              },
              _count: {
                  id_barang: true,
              },
              orderBy: {
                  _count: {
                      id_barang: 'desc',
                  }
              },
          });
  
          // Mendapatkan informasi tambahan untuk barang paling sering dipinjam
          const frequentlyBorrowedItemDetails = await Promise.all(frequentlyBorrowedItems.map(async item => {
              const barang = await prisma.barang.findUnique({
                  where: { id_barang: item.id_barang },
                  select: { id_barang: true, nama: true, category: true },
              });
              return barang ? {
                  item_id: item.id_barang,
                  name: barang.nama,
                  category: barang.category,
                  total_borrowed: item._count.id_barang,
              } : null;
          })).then(results => results.filter(item => item !== null)); // Menghapus item yang null
  
          // Query untuk mendapatkan barang dengan telat pengembalian
          const inefficientItems = await prisma.peminjaman.groupBy({
              by: ['id_barang'],
              where: {
                  borrow_date: {
                      gte: startDate,
                  },
                  return_date: {
                      gt: endDate // Asumsikan telat pengembalian adalah jika return_date lebih besar dari end_date
                  }
              },
              _count: {
                  id_barang: true,
              },
              _sum: {
                  qty: true,
              },
              orderBy: {
                  _count: {
                      id_barang: 'desc',
                  }
              },
          });
  
          // Mendapatkan informasi tambahan untuk barang yang telat pengembalian
          const inefficientItemDetails = await Promise.all(inefficientItems.map(async item => {
              const barang = await prisma.barang.findUnique({
                  where: { id_barang: item.id_barang },
                  select: { id_barang: true, nama: true, category: true },
              });
              return barang ? {
                  item_id: item.id_barang,
                  name: barang.nama,
                  category: barang.category,
                  total_borrowed: item._count.id_barang,
                  total_late_returns: item._sum.qty ?? 0, // Menangani kemungkinan nilai undefined
              } : null;
          })).then(results => results.filter(item => item !== null)); // Menghapus item yang null
  
          response.status(200).json({
              status: "success",
              data: {
                  analysis_period: {
                      start_date: start_date,
                      end_date: end_date
                  },
                  frequently_borrowed_items: frequentlyBorrowedItemDetails,
                  inefficient_items: inefficientItemDetails
              },
              message: "Analisis barang berhasil dihasilkan.",
          });
      } catch (error) {
          response.status(500).json({
              status: "error",
              message: `Terjadi kesalahan. ${(error as Error).message}`,
          });
      }
  };
  