"use client";

import { Bot, User, CalendarDays } from "lucide-react"; // Import CalendarDays for conference icon
import type { Agent, AgentEvent, GuardrailCheck } from "@/lib/types";
import { AgentsList } from "./agents-list";
import { Guardrails } from "./guardrails";
import { ConversationContext } from "./conversation-context";
import { RunnerOutput } from "./runner-output";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AgentPanelProps {
  agents: Agent[];
  currentAgent: string;
  events: AgentEvent[];
  guardrails: GuardrailCheck[];
  context: {
    passenger_name?: string; // This might become attendee_name
    confirmation_number?: string; // Likely not needed for conference
    seat_number?: string; // Not needed for conference
    flight_number?: string; // Not needed for conference
    account_number?: string; // This can be Attendee ID
    // Add new context fields here if they are directly used from the context prop
    // However, for customer details, we primarily use customerInfo prop
    is_conference_attendee?: boolean; // Ensure these are in context if they are not just in customerInfo
    conference_name?: string;
    conference_role?: string;
    job_title?: string;
    company_name?: string;
    bio?: string;
    social_media_links?: string[];
    contact_info?: string;
    registered_tracks?: string[];
    conference_interests?: string[];
    personal_schedule_events?: string[];
  };
  customerInfo?: {
    customer?: {
      name?: string;
      account_number?: string;
      email?: string;
      is_conference_attendee?: boolean;
      conference_name?: string;
      conference_role?: string; // NEW: Added from backend context
      job_title?: string; // NEW: Added from backend context
      company_name?: string; // NEW: Added from backend context
      // Add other conference-specific profile fields here if they are part of customerInfo
    };
    bookings: { // Keep this for type safety, but will hide it
      id: string;
      confirmation_number: string;
    }[];
  };
}

export function AgentPanel({
  agents,
  currentAgent,
  events,
  guardrails,
  context, // Context is used by ConversationContext component
  customerInfo,
}: AgentPanelProps) {
  const activeAgent = agents.find((a) => a.name === currentAgent);
  const runnerEvents = events.filter((e) => e.type !== "message");

  return (
    <div className="w-3/5 h-full flex flex-col border-r border-gray-200 bg-white rounded-xl shadow-sm">
      <div className="bg-blue-600 text-white h-12 px-4 flex items-center gap-3 shadow-sm rounded-t-xl">
        <CalendarDays className="h-5 w-5" /> {/* Changed icon from Bot to CalendarDays */}
        <h1 className="font-semibold text-sm sm:text-base lg:text-lg">Conference View</h1> {/* Changed title */}
        <span className="ml-auto text-xs font-light tracking-wide opacity-80">
          Conference&nbsp;Co. {/* Changed branding */}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
        {/* Customer Info Section - now Attendee Info */}
        {customerInfo && (
          <div className="mb-6">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-blue-800">
                  <User className="h-4 w-4" />
                  Attendee Information {/* Changed title */}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Name (can be Passenger Name or Attendee Name) */}
                  {customerInfo.customer?.name && (
                    <div>
                      <span className="text-blue-600 font-medium">Name:</span>{" "}
                      <span className="text-gray-800">{customerInfo.customer.name}</span>
                    </div>
                  )}
                  {/* Account (can be Account Number or Attendee ID) */}
                  {customerInfo.customer?.account_number && (
                    <div>
                      <span className="text-blue-600 font-medium">Attendee ID:</span>{" "} {/* Changed label */}
                      <span className="text-gray-800">{customerInfo.customer.account_number}</span>
                    </div>
                  )}
                  {/* Email */}
                  {customerInfo.customer?.email && (
                    <div className="col-span-2">
                      <span className="text-blue-600 font-medium">Email:</span>{" "}
                      <span className="text-gray-800">{customerInfo.customer.email}</span>
                    </div>
                  )}
                  {/* Conference Attendee Info */}
                  {customerInfo.customer?.is_conference_attendee !== undefined && (
                    <div className="col-span-2">
                      <span className="text-blue-600 font-medium">Conference Attendee:</span>{" "}
                      <span className="text-gray-800">
                        {customerInfo.customer.is_conference_attendee ? "Yes" : "No"}
                      </span>
                    </div>
                  )}
                  {customerInfo.customer?.is_conference_attendee && customerInfo.customer?.conference_name && (
                    <div className="col-span-2">
                      <span className="text-blue-600 font-medium">Conference:</span>{" "} {/* Changed label */}
                      <span className="text-gray-800">{customerInfo.customer.conference_name}</span>
                    </div>
                  )}
                   {customerInfo.customer?.is_conference_attendee && customerInfo.customer?.conference_role && (
                    <div className="col-span-2">
                      <span className="text-blue-600 font-medium">Role:</span>{" "}
                      <span className="text-gray-800">{customerInfo.customer.conference_role}</span>
                    </div>
                  )}
                   {customerInfo.customer?.is_conference_attendee && customerInfo.customer?.job_title && (
                    <div className="col-span-2">
                      <span className="text-blue-600 font-medium">Job Title:</span>{" "}
                      <span className="text-gray-800">{customerInfo.customer.job_title}</span>
                    </div>
                  )}
                   {customerInfo.customer?.is_conference_attendee && customerInfo.customer?.company_name && (
                    <div className="col-span-2">
                      <span className="text-blue-600 font-medium">Company:</span>{" "}
                      <span className="text-gray-800">{customerInfo.customer.company_name}</span>
                    </div>
                  )}
                  {/* Hide Active Bookings for conference mode */}
                  {!(customerInfo.customer?.is_conference_attendee) && (customerInfo.bookings && customerInfo.bookings.length > 0) && (
                    <div className="col-span-2">
                      <span className="text-blue-600 font-medium">Active Bookings:</span>{" "}
                      <span className="text-gray-800">{customerInfo.bookings.length || 0}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <AgentsList agents={agents} currentAgent={currentAgent} />
        <Guardrails
          guardrails={guardrails}
          inputGuardrails={activeAgent?.input_guardrails ?? []}
        />
        {/* ConversationContext will filter its own content */}
        <ConversationContext context={context} /> 
        <RunnerOutput runnerEvents={runnerEvents} />
      </div>
    </div>
  );
}



























// "use client";

// import { Bot, User } from "lucide-react";
// import type { Agent, AgentEvent, GuardrailCheck } from "@/lib/types";
// import { AgentsList } from "./agents-list";
// import { Guardrails } from "./guardrails";
// import { ConversationContext } from "./conversation-context";
// import { RunnerOutput } from "./runner-output";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// interface AgentPanelProps {
//   agents: Agent[];
//   currentAgent: string;
//   events: AgentEvent[];
//   guardrails: GuardrailCheck[];
//   context: {
//     passenger_name?: string;
//     confirmation_number?: string;
//     seat_number?: string;
//     flight_number?: string;
//     account_number?: string;
//     // Add new context fields here if they are directly used from the context prop
//     // However, for customer details, we primarily use customerInfo prop
//   };
//   customerInfo?: {
//     customer?: {
//       name?: string;
//       account_number?: string;
//       email?: string;
//       is_conference_attendee?: boolean; // NEW: Add to prop interface
//       conference_name?: string; // NEW: Add to prop interface
//     };
//     bookings: {
//       id: string;
//       confirmation_number: string;
//     }[];
//   };
// }

// export function AgentPanel({
//   agents,
//   currentAgent,
//   events,
//   guardrails,
//   context,
//   customerInfo,
// }: AgentPanelProps) {
//   const activeAgent = agents.find((a) => a.name === currentAgent);
//   const runnerEvents = events.filter((e) => e.type !== "message");

//   return (
//     <div className="w-3/5 h-full flex flex-col border-r border-gray-200 bg-white rounded-xl shadow-sm">
//       <div className="bg-blue-600 text-white h-12 px-4 flex items-center gap-3 shadow-sm rounded-t-xl">
//         <Bot className="h-5 w-5" />
//         <h1 className="font-semibold text-sm sm:text-base lg:text-lg">Agent View</h1>
//         <span className="ml-auto text-xs font-light tracking-wide opacity-80">
//           Airline&nbsp;Co.
//         </span>
//       </div>

//       <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
//         {/* Customer Info Section */}
//         {customerInfo && (
//           <div className="mb-6">
//             <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
//               <CardHeader className="pb-2">
//                 <CardTitle className="text-sm flex items-center gap-2 text-blue-800">
//                   <User className="h-4 w-4" />
//                   Customer Information
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="pt-0">
//                 <div className="grid grid-cols-2 gap-2 text-xs">
//                   <div>
//                     <span className="text-blue-600 font-medium">Name:</span>{" "}
//                     <span className="text-gray-800">{customerInfo.customer?.name}</span>
//                   </div>
//                   <div>
//                     <span className="text-blue-600 font-medium">Account:</span>{" "}
//                     <span className="text-gray-800">{customerInfo.customer?.account_number}</span>
//                   </div>
//                   <div className="col-span-2">
//                     <span className="text-blue-600 font-medium">Email:</span>{" "}
//                     <span className="text-gray-800">{customerInfo.customer?.email}</span>
//                   </div>
//                   {/* NEW: Display Conference Attendee Info */}
//                   {customerInfo.customer?.is_conference_attendee !== undefined && (
//                     <div className="col-span-2">
//                       <span className="text-blue-600 font-medium">Conference Attendee:</span>{" "}
//                       <span className="text-gray-800">
//                         {customerInfo.customer.is_conference_attendee ? "Yes" : "No"}
//                       </span>
//                     </div>
//                   )}
//                   {customerInfo.customer?.is_conference_attendee && customerInfo.customer?.conference_name && (
//                     <div className="col-span-2">
//                       <span className="text-blue-600 font-medium">Conference Name:</span>{" "}
//                       <span className="text-gray-800">{customerInfo.customer.conference_name}</span>
//                     </div>
//                   )}
//                   {/* END NEW */}
//                   <div className="col-span-2">
//                     <span className="text-blue-600 font-medium">Active Bookings:</span>{" "}
//                     <span className="text-gray-800">{customerInfo.bookings?.length || 0}</span>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         )}

//         <AgentsList agents={agents} currentAgent={currentAgent} />
//         <Guardrails
//           guardrails={guardrails}
//           inputGuardrails={activeAgent?.input_guardrails ?? []}
//         />
//         <ConversationContext context={context} />
//         <RunnerOutput runnerEvents={runnerEvents} />
//       </div>
//     </div>
//   );
// }
