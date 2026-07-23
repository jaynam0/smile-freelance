import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listMyBookings from "./tools/list-my-bookings";
import listOpenJobs from "./tools/list-open-jobs";
import createJobPost from "./tools/create-job-post";
import submitProposal from "./tools/submit-proposal";
import listMessages from "./tools/list-messages";
import sendMessage from "./tools/send-message";
import searchFreelancers from "./tools/search-freelancers";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "craftroll-mcp",
  title: "Craftroll MCP",
  version: "0.1.0",
  instructions:
    "Tools for the Craftroll freelance portal. Search and browse open jobs and freelancers, post jobs, submit proposals, and read or send messages inside bookings. All actions run as the signed-in Craftroll user.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listOpenJobs,
    searchFreelancers,
    createJobPost,
    submitProposal,
    listMyBookings,
    listMessages,
    sendMessage,
  ],
});
