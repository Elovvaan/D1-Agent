export type MyD1SocialChannel = {
  id: "facebook" | "instagram" | "youtube";
  label: string;
  url: string;
  status: "connected-url" | "not-connected";
  inboxStatus: "manual-capture" | "api-needed" | "not-configured";
};

const FACEBOOK_PROFILE_ID = "61591233282921";

export const myd1SocialChannels: MyD1SocialChannel[] = [
  {
    id: "facebook",
    label: "Facebook",
    url: `https://www.facebook.com/profile.php?id=${FACEBOOK_PROFILE_ID}`,
    status: "connected-url",
    inboxStatus: "manual-capture"
  },
  {
    id: "instagram",
    label: "Instagram",
    url: "",
    status: "not-connected",
    inboxStatus: "not-configured"
  },
  {
    id: "youtube",
    label: "YouTube",
    url: "",
    status: "not-connected",
    inboxStatus: "not-configured"
  }
];

export function getConnectedSocialChannels() {
  return myd1SocialChannels.filter((channel) => channel.status === "connected-url" && channel.url);
}
