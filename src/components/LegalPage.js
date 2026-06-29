export default function LegalPage({ section, onBack }) {
  const sections = {
    refund: {
      title: "Refund & Fulfillment Policy",
      content: [
        {
          heading: "Digital Product Fulfillment",
          body: `K9 Academy sells digital courses and downloadable content. Upon successful payment, access to your purchased course(s) is granted immediately through your K9 Academy account. You will receive access by logging into your account at k9academy.online and clicking "Refresh My Courses" on your dashboard.

No physical products are shipped. All content is delivered digitally and accessible online.`
        },
        {
          heading: "Refund Policy",
          body: `Due to the digital nature of our products, all sales are generally final. However, we want you to be satisfied with your purchase.

If you are unsatisfied with your purchase for any reason, please contact us within 7 days of your purchase date at the email address listed below. We will review your request on a case-by-case basis and, at our discretion, may offer a full or partial refund.

Refunds will not be granted if a significant portion of the course content has been accessed or downloaded.

To request a refund, email us with your order details and reason for the request. Approved refunds are processed within 5–10 business days back to your original payment method.`
        },
        {
          heading: "Contact",
          body: `For fulfillment issues or refund requests, please contact us at: zero.theshepherd.official@gmail.com`
        },
      ]
    },
    terms: {
      title: "Terms of Service",
      content: [
        {
          heading: "Acceptance of Terms",
          body: `By accessing or purchasing from K9 Academy (k9academy.online), you agree to be bound by these Terms of Service. If you do not agree, please do not use this site.`
        },
        {
          heading: "Products & Access",
          body: `K9 Academy sells digital educational courses related to dog training and ownership. Upon purchase, you are granted a personal, non-transferable, lifetime license to access the course content you purchased.

You may not share, resell, redistribute, copy, or reproduce any course content without express written permission from K9 Academy.`
        },
        {
          heading: "Educational Disclaimer",
          body: `All content provided by K9 Academy is for educational and informational purposes only. It is not a substitute for professional veterinary advice, diagnosis, or treatment. Always consult a qualified veterinarian or certified professional dog trainer for specific concerns about your dog's health, behavior, or safety.

Results from applying course content may vary by dog, owner, and circumstances. K9 Academy makes no guarantees about specific training outcomes.`
        },
        {
          heading: "User Accounts",
          body: `You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree to notify us immediately of any unauthorized use of your account.

You must provide accurate information when creating your account. Accounts may not be shared between multiple people.`
        },
        {
          heading: "Intellectual Property",
          body: `All course content, text, images, PDFs, and materials on K9 Academy are the intellectual property of K9 Academy and are protected by applicable copyright laws. Unauthorized reproduction or distribution is prohibited.`
        },
        {
          heading: "Limitation of Liability",
          body: `K9 Academy shall not be liable for any indirect, incidental, or consequential damages arising from your use of this site or its content. Our total liability for any claim shall not exceed the amount you paid for the product in question.`
        },
        {
          heading: "Changes to Terms",
          body: `We reserve the right to update these terms at any time. Continued use of the site after changes constitutes acceptance of the new terms.`
        },
        {
          heading: "Contact",
          body: `Questions about these terms? Email us at: zero.theshepherd.official@gmail.com`
        },
      ]
    },
    privacy: {
      title: "Privacy Policy",
      content: [
        {
          heading: "Information We Collect",
          body: `When you create an account or make a purchase, we collect your email address and purchase information. Payment processing is handled entirely by Stripe — we never store your credit card details.

We may collect basic usage data through Google Analytics (page views, session duration, general location) to improve our site. This data is anonymized and not tied to your personal identity.`
        },
        {
          heading: "How We Use Your Information",
          body: `We use your email address to provide access to your purchased courses and to respond to support requests. We do not sell, rent, or share your personal information with third parties for marketing purposes.

Purchase records are stored in a private Google Sheet accessible only to K9 Academy administrators.`
        },
        {
          heading: "Cookies",
          body: `K9 Academy uses session storage to save your course progress (checklist completions) locally in your browser. We also use Google Analytics cookies to understand site traffic. No personally identifiable information is stored in cookies.`
        },
        {
          heading: "Third-Party Services",
          body: `We use the following third-party services:

• Stripe — payment processing (stripe.com/privacy)
• Firebase — account authentication (firebase.google.com/support/privacy)
• Google Analytics — anonymous traffic analysis (policies.google.com/privacy)

Each of these services has their own privacy policies governing the data they collect.`
        },
        {
          heading: "Data Retention",
          body: `We retain your account and purchase information for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data by contacting us.`
        },
        {
          heading: "Your Rights",
          body: `You have the right to access, correct, or delete your personal information. To exercise these rights, contact us at the email below. We will respond within 30 days.`
        },
        {
          heading: "Contact",
          body: `Privacy questions or data requests: zero.theshepherd.official@gmail.com`
        },
      ]
    },
    disclaimer: {
      title: "Disclaimer",
      content: [
        {
          heading: "Educational Content Only",
          body: `The content provided through K9 Academy courses, guides, printables, and website is intended for general educational purposes only. It is based on personal experience and general dog training knowledge and should not be taken as professional veterinary or certified training advice.`
        },
        {
          heading: "No Guarantee of Results",
          body: `Dog training outcomes depend on many factors including the individual dog's temperament, history, health, the owner's consistency, and the specific situation. K9 Academy does not guarantee any specific results from applying the methods or information provided in our courses.`
        },
        {
          heading: "Consult a Professional",
          body: `For dogs displaying aggression, severe anxiety, fear responses, or any behavior that poses a safety risk, please consult a certified professional dog trainer or veterinary behaviorist. For any health concerns, always consult a licensed veterinarian.

Some techniques discussed in our courses may not be appropriate for all dogs. Use your judgment and consult a professional if you are unsure.`
        },
        {
          heading: "Assumption of Risk",
          body: `Dog training involves inherent risks. By applying any techniques or advice from K9 Academy, you acknowledge and accept responsibility for your own safety and the safety of others. K9 Academy is not liable for any injury, damage, or loss resulting from the application of course content.`
        },
      ]
    },
  };

  const current = sections[section] || sections.refund;

  return (
    <div style={{paddingTop:80, minHeight:"100vh", background:"var(--black)"}}>
      <div style={{maxWidth:760, margin:"0 auto", padding:"48px 24px 80px"}}>

        <button
          onClick={onBack}
          style={{background:"none",border:"none",color:"var(--muted)",fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",marginBottom:32,display:"flex",alignItems:"center",gap:6,transition:"color .2s",padding:0}}
          onMouseOver={e=>e.currentTarget.style.color="var(--cream)"}
          onMouseOut={e=>e.currentTarget.style.color="var(--muted)"}
        >
          ← Back
        </button>

        <div style={{fontSize:10,letterSpacing:"0.3em",textTransform:"uppercase",color:"var(--tan)",marginBottom:14}}>
          Legal
        </div>
        <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(36px,6vw,58px)",marginBottom:8,lineHeight:1}}>
          {current.title}
        </h1>
        <p style={{fontSize:13,color:"var(--muted)",marginBottom:48}}>
          Last updated: June 2026
        </p>

        {current.content.map((section, i) => (
          <div key={i} style={{marginBottom:40}}>
            <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:"var(--tan)",marginBottom:12,letterSpacing:"0.04em"}}>
              {section.heading}
            </h2>
            <p style={{fontSize:15,lineHeight:1.9,color:"rgba(245,240,232,0.75)",whiteSpace:"pre-wrap"}}>
              {section.body}
            </p>
          </div>
        ))}

        <div style={{borderTop:"1px solid var(--border)",paddingTop:32,marginTop:16}}>
          <div style={{fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--rust)",marginBottom:16}}>Other Legal Pages</div>
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            {[["refund","Refund & Fulfillment"],["terms","Terms of Service"],["privacy","Privacy Policy"],["disclaimer","Disclaimer"]].map(([id,label])=>(
              <button key={id} onClick={()=>onBack(id)}
                style={{background:"none",border:"1px solid var(--border)",color:section===id?"var(--tan)":"var(--muted)",fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",padding:"7px 16px",transition:"all .2s",letterSpacing:"0.05em"}}>
                {label}
              </button>
            ))}
          </div>
        </div>

      </div>

      <footer style={{borderTop:"1px solid var(--border)",padding:"28px 24px",textAlign:"center",fontSize:12,color:"var(--muted)",letterSpacing:"0.05em"}}>
        K9 Academy · Built by a real dog owner, for every dog owner.
      </footer>
    </div>
  );
}
