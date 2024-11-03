// socket.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const socketHandler = (io) => {
    io.on('connection', (socket) => {


        // Example event listener
        socket.on('message', (msg) => {
            console.log('Message received:', msg);
            io.emit('message', msg); // Broadcast message to all clients
        });

        socket.on('join-auction-admin', async (data) => {
            try {
                const { code } = data;

                // ดึง auction_id โดยใช้ code
                const auction = await prisma.auction.findFirst({
                    where: {
                        code
                    }
                });

                // ตรวจสอบว่าพบ auction หรือไม่
                if (!auction) {
                    socket.emit('join-error', {
                        msg: "ไม่พบการประมูล"
                    });
                    return;
                }

                const auction_id = auction.id; // ใช้ id ของการประมูล
                socket.join(code)

                const users = await prisma.userAuction.findMany({
                    where: {
                        auction_id
                    },
                    include: {
                        user: {
                            select: {
                                name: true,
                                organization: true
                            }
                        }
                    }
                });

                // ส่งข้อมูลผู้ใช้ที่เข้าร่วมให้กับผู้ใช้ใหม่
                socket.emit('auction-data', {
                    users,
                    auction
                });
            } catch (err) {
                console.log(err)
            }
        })

        socket.on('join-auction', async (data) => {
            try {
                const { user_id, code } = data;

                // ดึง auction_id โดยใช้ code
                const auction = await prisma.auction.findFirst({
                    where: {
                        code
                    }
                });

                // ตรวจสอบว่าพบ auction หรือไม่
                if (!auction) {
                    socket.emit('join-error', {
                        msg: "ไม่พบการประมูล"
                    });
                    return;
                }

                const auction_id = auction.id; // ใช้ id ของการประมูล
                socket.join(code)
                // ตรวจสอบในฐานข้อมูลว่า user_id มีอยู่ใน userAuction หรือไม่
                const haveUser = await prisma.userAuction.findFirst({
                    where: {
                        user_id: parseInt(user_id),
                        auction_id: auction_id // ไม่ต้องแปลงเป็นหมายเลขอีกครั้ง เพราะเป็นหมายเลขอยู่แล้ว
                    },
                    include: {
                        auction: {
                            select: {
                                mode: true
                            }
                        }
                    }
                });

                if (haveUser) {
                    // ถ้ามีผู้ใช้แล้ว
                    if (haveUser.auction.mode === "lobby") {
                        const users = await prisma.userAuction.findMany(
                            {
                                where: {
                                    auction_id
                                },
                                include: {
                                    user: {
                                        select: {
                                            name: true,
                                            organization: true
                                        }
                                    }
                                }
                            });

                        // ส่งข้อมูลผู้ใช้ที่เข้าร่วมให้กับผู้ใช้ใหม่
                        socket.emit('auction-data', {
                            users
                        });


                    } else {
                        socket.emit('redirect', "auction");
                    }
                } else {

                    // เพิ่ม user เข้าร่วมประมูล
                    if (auction.mode !== "lobby") {

                        socket.emit('join-error', {
                            msg: "การประมูลเริ่มขึ้นแล้ว"
                        });
                        return;

                    }
                    const newUser = await prisma.userAuction.create({
                        data: {
                            user_id: parseInt(user_id), // แปลงเป็นหมายเลข
                            auction_id: auction_id, // ใช้ id ที่ได้จากการดึงข้อมูล
                            status: 'active'
                        }
                    });

                    socket.emit('join-success', {
                        msg: "เข้าร่วมการประมูลเรียบร้อย"
                    });

                    // Broadcast ข้อมูลผู้ใช้ใหม่ให้กับทุกคนในห้อง
                    const users = await prisma.userAuction.findMany({
                        where: {
                            auction_id
                        },
                        include: {
                            user: {
                                select: {
                                    name: true,
                                    organization: true
                                }
                            }
                        }
                    });
                    socket.emit('auction-data', {
                        users
                    });
                    socket.broadcast.to(code).emit('new-user-joined', {
                        users
                    });
                }
            } catch (err) {
                console.error("Error joining auction:", err);
                socket.emit('join-error', {
                    err,
                    msg: "การเข้าร่วมประมูลผิดพลาด"
                });
            }
        });

        socket.on('start-auction', async ({ code }) => {
            try {
                const res = await prisma.auction.update({
                    where: {
                        code
                    },
                    data: {
                        mode: "offer",
                        action_btn: "จับเวลา"
                    }
                })
                io.to(code).emit("auction-started", {
                    msg: "เริ่มการประมูล"
                })
            } catch (err) {
                socket.emit('error', err)
            }


        })

        socket.on('res-data', async (data) => {
            try {
                const { code, user_id } = data;

                // ดึง auction_id โดยใช้ code
                const auction = await prisma.auction.findFirst({
                    where: {
                        code
                    }
                });


                // ตรวจสอบว่าพบ auction หรือไม่
                if (!auction) {
                    socket.emit('join-error', {
                        msg: "ไม่พบการประมูล"
                    });
                    return;
                }
                const haveUser = await prisma.userAuction.findFirst({
                    where: {
                        user_id,
                        auction_id: auction.id
                    }
                })

                if (!haveUser) {
                    socket.emit('join-error', {
                        msg: "ท่านไม่มีชื่อในการประมูล"
                    });
                    return;
                }


                const auction_id = auction.id; // ใช้ id ของการประมูล
                socket.join(code)

                const users = await prisma.userAuction.findMany({
                    where: {
                        auction_id
                    },
                    include: {
                        user: {
                            select: {
                                name: true,
                                organization: true
                            }
                        }
                    }
                });
                const status = await prisma.userAuction.findFirst({
                    where: {
                        user_id,
                        auction_id
                    }
                })

                // ส่งข้อมูลผู้ใช้ที่เข้าร่วมให้กับผู้ใช้ใหม่
                socket.emit('auction-data', {
                    users,
                    auction,
                    status
                });
            } catch (err) {
                console.log(err)
            }
        })


        //Admin Action Here
        socket.on('start-timer', async ({ time, code }) => {
            try {
                // Update the auction with new time and button state
                const res = await prisma.auction.update({
                    where: {
                        code,
                    },
                    data: {
                        time: String(time),
                        action_btn: "รอบถัดไป"
                    }
                });
                await prisma.log.create({
                    data: {
                        auction_id: res.id,
                        message: `เริ่มจับเวลารอบที่ ${res.round}`,
                        time,
                    }
                })
                // Emit updated data to all clients in the specified room
                io.to(code).emit("timer-started", res);

            } catch (error) {
                console.error("Error updating auction timer:", error);
                socket.emit("error", {
                    msg: "เกิดข้อผิดพลาดในการอัปเดตเวลา",
                    error: error.message
                });
            }
        });

        socket.on('stop-timer', async ({ code }) => {
            try {
                // Update auction with current Unix timestamp and button text
                const res = await prisma.auction.update({
                    where: {
                        code,
                    },
                    data: {
                        time: String(Math.floor(Date.now() / 1000)) // Current time in Unix (seconds)

                    }
                });

                // Emit updated data to all clients in the specified room
                io.to(code).emit("timer-stopped", res);

            } catch (error) {
                console.error("Error stopping auction timer:", error);
                socket.emit("error", {
                    msg: "เกิดข้อผิดพลาดในการหยุดการจับเวลา",
                    error: error.message
                });
            }
        });

        socket.on('next-round', async ({ inputType, inputValue, code }) => {
            try {
                // Fetch the necessary data from the auction table
                console.log("code", code)
                const auction = await prisma.auction.findFirst({
                    where: { code },
                    select: { current_price: true, opening_price: true, round: true, id: true }
                });

                if (!auction) {
                    throw new Error("Auction not found");
                }
                const auction_id = auction.id
                console.log("first", auction_id)
                // Define incrementAmount outside of the condition block
                let incrementAmount;

                // Calculate incrementAmount based on inputType
                if (inputType === "percent") {
                    incrementAmount = auction.opening_price * (inputValue / 100);
                } else {
                    incrementAmount = inputValue;
                }

                // Update current_price and increment the round
                const result = await prisma.auction.update({
                    where: { code },
                    data: {
                        current_price: auction.current_price + parseFloat(incrementAmount),
                        round: auction.round + 1,
                        action_btn: "จับเวลา"
                    }
                });

                await prisma.userAuction.updateMany({
                    where: {
                        auction_id,
                        status: "semi_inactive"
                    },
                    data: {
                        status: "inactive"
                    }
                })
                const fallUsers = await prisma.userAuction.findMany({
                    where: {
                        accepted: false,
                        status: "active",
                        auction_id,
                    },
                    include: {
                        user: true,
                    },
                });

                fallUsers.forEach(async (u) => {
                    await prisma.log.create({
                        data: {
                            auction_id,
                            user_id: u.user_id,
                            message: `ตกรอบในรอบที่ ${auction.round}`, // Use backticks for template literals
                        },
                    });
                });


                await prisma.userAuction.updateMany({
                    where: {
                        accepted: false,
                        status: "active",
                        auction_id
                    },
                    data: {
                        status: "semi_inactive"
                    }
                })

                await prisma.userAuction.updateMany({
                    where: {
                        accepted: true,
                        status: "active",
                        auction_id
                    },
                    data: {
                        accepted: false
                    }
                })

                // Optionally, emit a success message or broadcast to other clients
                const newUsers = await prisma.userAuction.findMany({
                    where: {
                        auction_id
                    },
                    include: {
                        user: {
                            select: {
                                name: true,
                                organization: true
                            }
                        }
                    }
                });
                console.log(newUsers)
                io.to(code).emit("next-round-success", { result, newUsers });


            } catch (error) {
                console.error("Error starting next round:", error);
                socket.emit("error", {
                    msg: "เกิดข้อผิดพลาดในการเริ่มรอบถัดไป",
                    error: error.message
                });
            }
        });

        socket.on('change-mode', async ({ users, code }) => {
            try {
                // First, perform the update
                for (let i = 0; i < users.length; i++) {
                    await prisma.userAuction.update({
                        where: {
                            user_id_auction_id: {
                                user_id: parseInt(users[i].user_id),
                                auction_id: parseInt(users[i].auction_id)
                            }
                        },
                        data: {
                            isAllowed: true
                        }
                    })
                }

                await prisma.auction.update({
                    where: {
                        code,
                    },
                    data: {
                        mode: "bid",
                        time: null,
                        round: {
                            increment: 1, // Use increment to increase the round value by 1
                        },
                    },
                });


                await prisma.log.create({
                    data: {
                        auction_id: users[0].auction_id,
                        message: "เปลี่ยนเป็น Mode เสนอราคา"
                    }
                })

                await Promise.all(
                    users.map((u) =>
                        prisma.log.create({
                            data: {
                                auction_id: u.auction_id,
                                user_id: u.user_id,
                                message: `ได้เลือกให้ไปต่อในการเสนอราคา`,
                            },
                        })
                    )
                );
                io.to(code).emit('mode-changed', (users))



            } catch (error) {
                console.error("Error starting next round:", error);
                socket.emit("error", {
                    msg: "เกิดข้อผิดพลาดในการเปลี่ยน mode",
                    error: error.message
                });
            }
        })

        socket.on('rebid', async ({ code }) => {
            try {
                // Step 1: ค้นหาการประมูลโดยใช้ code
                const auction = await prisma.auction.findFirst({
                    where: {
                        code
                    }
                });

                if (!auction) {
                    throw new Error("Auction not found with the provided code.");
                }

                // Step 2: ค้นหาค่า bid สูงสุดใน userAuction ที่ตรงกับ auction_id
                const highestAuction = await prisma.userAuction.aggregate({
                    where: {
                        auction_id: auction.id,
                    },
                    _max: {
                        bid: true,
                    },
                });

                // Step 3: ตรวจสอบค่า bid ก่อนอัปเดต auction
                const highestBid = highestAuction._max.bid;
                if (highestBid !== null) {
                    await prisma.auction.update({
                        where: {
                            id: auction.id
                        },
                        data: {
                            current_price: parseFloat(highestBid),
                            round: {
                                increment: 1, // Use increment to increase the round value by 1
                            },
                        }
                    });

                    await prisma.log.create({
                        data: {
                            auction_id: auction.id,
                            message: "ให้ users เสนอราคาอีกครั้ง"
                        }
                    })

                } else {
                    console.log("No bids found for this auction.");
                }

                // Step 4: ปรับปรุงสถานะของ userAuction records ที่เกี่ยวข้อง

                const fallUsers = await prisma.userAuction.findMany({
                    where: {
                        auction_id: auction.id,
                        bidded: false,
                        isAllowed: true
                    }
                });
                await Promise.all(
                    fallUsers.map((u) =>
                        prisma.log.create({
                            data: {
                                auction_id: auction.id,
                                user_id: u.user_id,
                                message: `ตกรอบในรอบที่ ${auction.round}`,
                            },
                        })
                    )
                );


                await prisma.userAuction.updateMany({
                    where: {
                        auction_id: auction.id,
                        bidded: false,
                        isAllowed: true
                    },
                    data: {
                        isAllowed: false
                    }
                });
                //
                await prisma.userAuction.updateMany({
                    where: {
                        auction_id: auction.id,
                        bidded: true,
                        isAllowed: true
                    },
                    data: {
                        bidded: false
                    }
                });

                const res = await prisma.userAuction.findMany({
                    where: {
                        auction_id: auction.id,
                        bidded: false,
                        isAllowed: true
                    }
                })



                io.to(code).emit('rebid-success', (res))
                //เพิ่ม locig เตะคน

            } catch (error) {
                console.error("Error:", error);
                socket.emit("error", {
                    msg: "เกิดข้อผิดพลาดในการประมูล",
                    error: error.message
                });
            }
        });


        socket.on('stop-auction', async ({ code }) => {
            try {

                await prisma.auction.update({
                    where: {
                        code
                    },
                    data: {
                        mode: "done"
                    }
                })

                io.to(code).emit("auction-stopped")
            } catch (error) {
                console.error("Error:", error);
                socket.emit("error", {
                    msg: "เกิดข้อผิดพลาดในการประมูล",
                    error: error.message
                });
            }
        })

        //Users Action Here
        socket.on("accepted-price", async ({ user_id, code }) => {
            try {
                const auction = await prisma.auction.findFirst({
                    where: {
                        code
                    }
                });

                // ตรวจสอบว่าพบ auction หรือไม่
                if (!auction) {
                    socket.emit('join-error', {
                        msg: "ไม่พบการประมูล"
                    });
                    return;
                }

                const auction_id = auction.id; // ใช้ id ของการประมูล
                await prisma.userAuction.update({
                    where: {
                        user_id_auction_id: {
                            user_id: parseInt(user_id),
                            auction_id: parseInt(auction_id)
                        }
                    },
                    data: {
                        accepted: true
                    }
                });


                const users = await prisma.userAuction.findMany({
                    where: {
                        auction_id
                    },
                    include: {
                        user: {
                            select: {
                                name: true,
                                organization: true
                            }
                        }
                    }
                });

                const status = await prisma.userAuction.findFirst({
                    where: {
                        user_id,
                        auction_id
                    }
                })

                await prisma.log.create({
                    data: {
                        auction_id,
                        user_id,
                        message: "ได้ยอมรับราคา",
                        time: auction.time
                    }
                })

                io.to(code).emit("accepted-price-success", { users, status })
            } catch (error) {
                console.error("Error starting next round:", error);
                socket.emit("error", {
                    msg: "เกิดข้อผิดพลาดในการยอมรับราคากรุณาติดต่อ Admin",
                    error: error.message
                });
            }
        })

        socket.on("bid", async ({ user_id, auction_id, bid, code, time }) => {


            try {
                await prisma.userAuction.update({
                    where: {
                        user_id_auction_id: {
                            user_id: parseInt(user_id),
                            auction_id: parseInt(auction_id)
                        }
                    },
                    data: {
                        bid: parseFloat(bid),
                        bidded: true
                    }
                })
                io.to(code).emit("bid-success", {
                    user_id: user_id,
                    bid
                }) // res to user who bid
                await prisma.log.create({
                    data: {
                        auction_id,
                        user_id,
                        message: `ได้เสนอราคาจำนวน ${bid}`,
                        time: time
                    }
                })

            } catch (error) {
                console.error("Error starting next round:", error);
                socket.emit("error", {
                    msg: "เกิดข้อผิดพลาดในการเสนอราคากรุณาติดต่อ Admin",
                    error: error.message
                });
            }
        })





        socket.on('disconnect', () => {

        });
    });
};

module.exports = socketHandler;
