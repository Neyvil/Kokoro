import { Resend } from "resend"

let resend: Resend | null = null

function getResendClient(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error("Missing RESEND_API_KEY environment variable")
    }
    resend = new Resend(apiKey)
  }
  return resend
}

interface SendReminderEmailParams {
  to: string
  title: string
  description?: string
  scheduledAt: Date
  priority: "low" | "medium" | "high"
}

export async function sendReminderEmail({ to, title, description, scheduledAt, priority }: SendReminderEmailParams) {
  const priorityColors = {
    low: "#6B7280",
    medium: "#D97706",
    high: "#DC2626",
  }

  const formattedDate = scheduledAt.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const formattedTime = scheduledAt.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reminder from Kokoro</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #FBF9F7;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FBF9F7; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                <!-- Header -->
                <tr>
                  <td style="background-color: #E07A5F; padding: 32px; text-align: center;">
                    <table cellpadding="0" cellspacing="0" align="center">
                      <tr>
                        <td style="background-color: rgba(255,255,255,0.2); border-radius: 8px; padding: 8px 12px;">
                          <span style="color: #FFFFFF; font-size: 24px;">❤️</span>
                        </td>
                        <td style="padding-left: 12px;">
                          <span style="color: #FFFFFF; font-size: 24px; font-weight: 700;">Kokoro</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 32px;">
                    <h1 style="margin: 0 0 8px 0; color: #1F2937; font-size: 24px; font-weight: 700;">
                      Time for your reminder
                    </h1>
                    <p style="margin: 0 0 24px 0; color: #6B7280; font-size: 16px;">
                      Here's what you wanted to remember:
                    </p>
                    
                    <!-- Reminder Card -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F9FAFB; border-radius: 12px; border: 1px solid #E5E7EB;">
                      <tr>
                        <td style="padding: 24px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td>
                                <span style="display: inline-block; background-color: ${priorityColors[priority]}20; color: ${priorityColors[priority]}; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase;">
                                  ${priority} priority
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-top: 16px;">
                                <h2 style="margin: 0; color: #1F2937; font-size: 20px; font-weight: 600;">
                                  ${title}
                                </h2>
                              </td>
                            </tr>
                            ${
                              description
                                ? `
                            <tr>
                              <td style="padding-top: 8px;">
                                <p style="margin: 0; color: #6B7280; font-size: 16px; line-height: 1.5;">
                                  ${description}
                                </p>
                              </td>
                            </tr>
                            `
                                : ""
                            }
                            <tr>
                              <td style="padding-top: 16px;">
                                <table cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td style="padding-right: 24px;">
                                      <p style="margin: 0; color: #9CA3AF; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Date</p>
                                      <p style="margin: 4px 0 0 0; color: #374151; font-size: 14px; font-weight: 500;">${formattedDate}</p>
                                    </td>
                                    <td>
                                      <p style="margin: 0; color: #9CA3AF; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Time</p>
                                      <p style="margin: 4px 0 0 0; color: #374151; font-size: 14px; font-weight: 500;">${formattedTime}</p>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 32px;">
                      <tr>
                        <td align="center">
                          <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://kokoro.app"}/dashboard" style="display: inline-block; background-color: #E07A5F; color: #FFFFFF; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 8px; text-decoration: none;">
                            View in Dashboard
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #F9FAFB; padding: 24px 32px; text-align: center; border-top: 1px solid #E5E7EB;">
                    <p style="margin: 0; color: #9CA3AF; font-size: 14px;">
                      You're receiving this because you created a reminder on Kokoro.
                    </p>
                    <p style="margin: 8px 0 0 0; color: #9CA3AF; font-size: 14px;">
                      <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://kokoro.app"}/dashboard/settings" style="color: #E07A5F; text-decoration: underline;">Manage notification settings</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `

  const { data, error } = await getResendClient().emails.send({
    from: "Kokoro <onboarding@resend.dev>",  // ✅ Works immediately (test domain)
    to: [to],
    subject: `Reminder: ${title}`,
    html: htmlContent,
  })

  if (error) {
    console.error("Error sending email:", error)
    throw error
  }

  return data
}
