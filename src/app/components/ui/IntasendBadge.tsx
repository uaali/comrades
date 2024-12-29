const IntasendBadge = () => {
  return (
    <span style={{ display: "block", textAlign: "center" }}>
      <a href="https://intasend.com/security" target="_blank">
        <img
          src="https://intasend-prod-static.s3.amazonaws.com/img/trust-badges/intasend-trust-badge-with-mpesa-hr-dark.png"
          width="375px"
          alt="IntaSend Secure Payments (PCI-DSS Compliant)"
        />
      </a>
      <strong>
        <a
          style={{
            display: "block",
            color: "#fafafa",
            textDecoration: "none",
            fontSize: "0.8em",
            marginTop: "0.6em",
          }}
          href="https://intasend.com/security"
          target="_blank"
        >
          Secured by IntaSend Payments
        </a>
      </strong>
    </span>
  );
};

export default IntasendBadge;
