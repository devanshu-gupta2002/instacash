import  express  from "express";
import database from "@repo/db/client"
const app = express()

app.post('/hdfcWebhook', async (req, res) => {
  const db = database.default
  const paymentInformation : {
    token: string
    userId: string
    amount: string
  } = {
    token: req.body.token,
    userId: req.body.user_identifier,
    amount: req.body.amount
  }

 try {
  await db.$transaction([
    db.balance.updateMany({
      where: {
        userId: Number(paymentInformation.userId)
      },
      data: {
        amount: {
          increment: Number(paymentInformation.amount)
        }
      }
    }),
    db.onRampTransaction.updateMany({
      where: {
        token: paymentInformation.token
      },
      data: {
        status: "Success"
      }
    })
  ])

  res.json({
    message: "Captured"
  })
} catch (error) {
    console.log(error)
    res.status(411).json({
      message: "Error while processing webhook"
    })
 } 
})