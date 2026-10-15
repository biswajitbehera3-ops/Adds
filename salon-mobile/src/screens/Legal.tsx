/**
 * Privacy & terms, reachable from sign-in, the staff menu, the owner area and the
 * new-customer form. Shows who runs the salon, the short privacy notice, people's
 * rights, retention, and where the full policies live. Text comes from config so
 * each salon's build carries its own details.
 */
import { Linking, View } from "react-native";
import { Press } from "../components/Press";
import { Rule, Screen, SectionTitle } from "../components/Screen";
import { T } from "../components/T";
import config from "../config/salon";
import { color, space } from "../theme/tokens";

const years = (days: number) => (days % 365 === 0 ? `${days / 365} year${days === 365 ? "" : "s"}` : `${days} days`);

export function Legal() {
  const b = config.business;
  const r = config.retention;
  return (
    <Screen title="Privacy & terms">
      <SectionTitle>Who we are</SectionTitle>
      <Line k="Business" v={b.legalName} />
      <Line k="Address" v={b.address} />
      {b.gstin ? <Line k="GSTIN" v={b.gstin} /> : null}
      <Line k="Phone" v={b.phone} />
      <Line k="Email" v={b.email} />

      <SectionTitle>Privacy notice</SectionTitle>
      <P>We collect only what we need to serve you: your name, mobile number, the services you take, what you pay and your wallet balance. If you are under 18, we keep the record under your parent's or guardian's number, with their consent.</P>
      <P>We use it to run your visits and wallet, give referral rewards, and, only if you agree, send WhatsApp reminders and offers. We never sell your data or share it for anyone else's marketing.</P>
      <P>{`Your data is stored securely for this salon only. ${config.legal.providerName} provides the app and handles the data only on our instructions.`}</P>

      <SectionTitle>Your rights</SectionTitle>
      <P>Ask us at the counter or contact the grievance officer below to:</P>
      <Bullet>get a copy of your data</Bullet>
      <Bullet>correct it</Bullet>
      <Bullet>stop WhatsApp messages (or reply STOP)</Bullet>
      <Bullet>delete your data (we refund your unused paid wallet money first)</Bullet>
      <Bullet>nominate someone to act for you</Bullet>
      <P>If we don't resolve your complaint, you can complain to the Data Protection Board of India.</P>

      <SectionTitle>Grievance officer</SectionTitle>
      <Line k="Name" v={b.grievance.name} />
      <Line k="Phone" v={b.grievance.phone} />
      <Line k="Email" v={b.grievance.email} />
      <P>We reply within 7 days.</P>

      <SectionTitle>How long we keep data</SectionTitle>
      <Bullet>{`Customers with no visit or wallet activity for ${years(r.inactiveCustomerDays)} are deleted automatically (wallet must be empty).`}</Bullet>
      <Bullet>{`Staff attendance selfies: ${years(r.attendancePhotoDays)}.`}</Bullet>
      <Bullet>{`Copies of reminder messages: ${years(r.reminderLogDays)}.`}</Bullet>
      <Bullet>Bills stay, without name or number, for the salon's tax records.</Bullet>

      <SectionTitle>Wallet and refunds</SectionTitle>
      <P>Money you add to your wallet can be used for any service here. Unused paid money is refunded when you ask to close your wallet. Bonus and referral credit are free extras: they are used first and are not refundable.</P>

      <SectionTitle>Full documents</SectionTitle>
      <LinkRow label="Privacy policy" url={config.legal.privacyUrl} />
      <LinkRow label="Terms of service & refund policy" url={config.legal.termsUrl} />
      <P>{`Notice version ${config.legal.noticeVersion}. This app uses no cookies, no advertising and no tracking.`}</P>

      <SectionTitle>Credits</SectionTitle>
      <P>Fonts under the SIL Open Font License. App built with open-source software (MIT, Apache-2.0 and similar licences). The salon's logo and intro video are used with the salon's permission.</P>
    </Screen>
  );
}

function P({ children }: { children: string }) {
  return (
    <T v="body" style={{ marginBottom: space.sm }}>
      {children}
    </T>
  );
}

function Bullet({ children }: { children: string }) {
  return (
    <View style={{ flexDirection: "row", gap: space.sm, marginBottom: 4 }}>
      <T v="body" accessibilityElementsHidden importantForAccessibility="no">
        •
      </T>
      <T v="body" style={{ flex: 1 }}>
        {children}
      </T>
    </View>
  );
}

function Line({ k, v }: { k: string; v: string }) {
  return (
    <View>
      <View style={{ flexDirection: "row", gap: space.md, paddingVertical: 6 }}>
        <T v="small" c={color.inkMuted} style={{ width: 84 }}>
          {k}
        </T>
        <T v="bodyStrong" style={{ flex: 1 }} selectable>
          {v}
        </T>
      </View>
      <Rule />
    </View>
  );
}

function LinkRow({ label, url }: { label: string; url: string }) {
  const real = /^https?:\/\//.test(url);
  return (
    <Press
      onPress={() => (real ? Linking.openURL(url).catch(() => {}) : undefined)}
      accessibilityRole="link"
      accessibilityLabel={real ? label : `${label}, not set up yet`}
      style={{ minHeight: 44, justifyContent: "center" }}
    >
      <T v="bodyStrong" c={real ? color.seal : color.inkMuted} style={real ? { textDecorationLine: "underline" } : undefined}>
        {real ? label : `${label} (link not set yet)`}
      </T>
    </Press>
  );
}
