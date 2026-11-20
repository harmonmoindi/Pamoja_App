import { Bell } from "lucide-react";
import { Link } from "react-router";
import { BeneficiaryPage } from "@/components/beneficiary/BeneficiaryPage";
import { useBeneficiaryRequests } from "@/components/beneficiary/BeneficiaryRequests";

export default function Notifications() {
  const { requests } = useBeneficiaryRequests();
  const notes = [
    {
      id: "prototype",
      title: "Demonstration workspace",
      body: "Updates on this page are fictional and stay in this browser. No agency has been notified.",
      time: "Today",
      to: "/beneficiary/dashboard",
    },
    ...requests.slice(0, 5).map((request) => ({
      id: request.reference,
      title: `${request.reference} is ${request.status}`,
      body: `${request.title} in ${request.location} is recorded as ${request.status}.`,
      time: request.submittedOn,
      to: `/beneficiary/requests/${request.reference}`,
    })),
  ];

  return (
    <BeneficiaryPage title="Notifications" description="Fictional updates for the requests in this demonstration workspace.">
      <ul className="bn-notes bn-section">
        {notes.map((note) => (
          <li key={note.id}>
            <span className="bn-note-icon" aria-hidden="true">
              <Bell size={16} />
            </span>
            <div>
              <Link to={note.to}>{note.title}</Link>
              <p>{note.body}</p>
            </div>
            <time>{note.time}</time>
          </li>
        ))}
      </ul>
    </BeneficiaryPage>
  );
}
