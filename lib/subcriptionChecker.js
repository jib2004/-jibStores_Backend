import { CronJob } from "cron";
import { userModel } from "../Schema/usersInfoSchema.js";

export const subscriptionChecker = new CronJob(
    '0 0 * * *', // Runs every day at 12:00 AM,
    async function() {
        try {
            const users = await userModel.find({ "subscription.isSubscriptionActive": true });
            const currentDate = new Date();
            for (const user of users) {
                const expiryDate = new Date(user.subscription.expiresAt);
                if (currentDate >= expiryDate) {
                    user.subscription.isSubscriptionActive = false;
                    user.plan = 'free';
                    await user.save();
                    console.log(`Subscription expired for user: ${user._id}`);
                }
            }
        } catch (error) {
            console.log(`cron error -> ${error}`)
        }
        
    },
    null,
    true,
    'Africa/Lagos'
)
