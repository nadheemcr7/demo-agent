"use client";

import { PanelSection } from "./panel-section";
import { Card, CardContent } from "@/components/ui/card";
import { BookText } from "lucide-react";

interface ConversationContextProps {
  context: {
    passenger_name?: string; // This can be renamed/hidden for conference
    confirmation_number?: string; // Hide for conference
    seat_number?: string; // Hide for conference
    flight_number?: string; // Hide for conference
    account_number?: string; // Keep as Attendee ID
    customer_id?: string; // Keep
    customer_email?: string; // Keep
    customer_bookings?: Array<Record<string, any>>; // Hide for conference
    
    // Explicitly list conference-specific fields you want to show
    is_conference_attendee?: boolean;
    conference_name?: string;
    conference_role?: string;
    job_title?: string;
    company_name?: string;
    bio?: string;
    social_media_links?: string[]; // Assuming this is an array of strings
    contact_info?: string;
    registered_tracks?: string[];
    conference_interests?: string[];
    personal_schedule_events?: string[];

    [key: string]: any; // Allow for other dynamic properties
  };
}

export function ConversationContext({ context }: ConversationContextProps) {
  // Define keys that are explicitly for airline and should be hidden in conference mode
  const airlineKeysToHide = [
    "confirmation_number",
    "seat_number",
    "flight_number",
    "customer_bookings",
    // "passenger_name" could be ambiguous; if it truly only means flight passenger, hide it.
    // Otherwise, it might be the general user's name which is fine.
  ];

  const displayContextEntries = Object.entries(context || {}).filter(([key, value]) => {
    // Hide airline-specific keys
    if (airlineKeysToHide.includes(key)) return false;

    if (value === undefined || value === null) return false;
    if (Array.isArray(value) && value.length === 0) return false;
    if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) return false;
    return true;
  });

  return (
    <PanelSection
      title="Conversation Context"
      icon={<BookText className="h-4 w-4 text-blue-600" />}
    >
      <Card className="bg-gradient-to-r from-white to-gray-50 border-gray-200 shadow-sm">
        <CardContent className="p-3">
          <div className="grid grid-cols-2 gap-2">
            {displayContextEntries.length > 0 ? (
              displayContextEntries.map(([key, value]) => {
                let displayValue;

                if (Array.isArray(value)) {
                  displayValue = value.join(', '); // For arrays like social_media_links, registered_tracks
                  if (displayValue === '') displayValue = 'None';
                } else if (typeof value === 'boolean') {
                    displayValue = value ? 'Yes' : 'No';
                } else if (typeof value === 'object' && value !== null) {
                  // For objects, stringify or pick specific fields if they are known structures
                  displayValue = JSON.stringify(value); 
                } else {
                  // For primitive types (string, number)
                  displayValue = String(value);
                }

                // Friendly display key
                let displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
                if (key === "account_number") displayKey = "Attendee ID"; // Specific override
                if (key === "passenger_name") displayKey = "Attendee Name"; // Specific override if it's the general name

                return (
                  <div
                    key={key}
                    className="flex items-center gap-2 bg-white p-2 rounded-md border border-gray-200 shadow-sm transition-all"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <div className="text-xs">
                      <span className="text-zinc-500 font-light capitalize">
                        {displayKey}: {/* Use the formatted display key */}
                      </span>{" "}
                      <span
                        className={
                          displayValue && displayValue !== "null" && displayValue !== "undefined"
                            ? "text-zinc-900 font-light break-words"
                            : "text-gray-400 italic"
                        }
                      >
                        {displayValue || "N/A"}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 text-gray-500 italic p-2">No active context details for conference.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </PanelSection>
  );
}























// "use client";

// import { PanelSection } from "./panel-section";
// import { Card, CardContent } from "@/components/ui/card";
// import { BookText } from "lucide-react";

// interface ConversationContextProps {
//   context: {
//     passenger_name?: string;
//     confirmation_number?: string;
//     seat_number?: string;
//     flight_number?: string;
//     account_number?: string;
//     // Add new fields from AirlineAgentContext that are now passed
//     customer_id?: string;
//     booking_id?: string;
//     flight_id?: string;
//     customer_email?: string;
//     customer_bookings?: Array<Record<string, any>>; // Array of booking objects
//     [key: string]: any; // Allow for other dynamic properties
//   };
// }

// export function ConversationContext({ context }: ConversationContextProps) {
//   // Filter out properties that are undefined, null, or empty arrays/objects for cleaner display
//   const displayContextEntries = Object.entries(context || {}).filter(([key, value]) => {
//     if (value === undefined || value === null) return false; // Filter out null/undefined
//     if (Array.isArray(value) && value.length === 0) return false; // Filter out empty arrays
//     // Filter out empty plain objects (but not arrays or other specific objects you want to display)
//     if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) return false;
//     return true;
//   });

//   return (
//     <PanelSection
//       title="Conversation Context"
//       icon={<BookText className="h-4 w-4 text-blue-600" />}
//     >
//       <Card className="bg-gradient-to-r from-white to-gray-50 border-gray-200 shadow-sm">
//         <CardContent className="p-3">
//           <div className="grid grid-cols-2 gap-2">
//             {displayContextEntries.length > 0 ? (
//               displayContextEntries.map(([key, value]) => {
//                 let displayValue;

//                 if (Array.isArray(value)) {
//                   // Handle arrays (e.g., customer_bookings)
//                   if (key === "customer_bookings") {
//                     displayValue = `${value.length} active booking${value.length === 1 ? '' : 's'}`;
//                     // You could further enhance this to list specific details, e.g.:
//                     // displayValue = value.map(b => b.confirmation_number).join(', ') || 'None';
//                   } else {
//                     // Generic array display
//                     displayValue = `[${value.length} items]`;
//                   }
//                 } else if (typeof value === 'object') {
//                   // Handle other generic objects (e.g., if a complex object found its way in)
//                   // For better readability, consider stringifying with indentation or picking specific fields
//                   displayValue = JSON.stringify(value); 
//                 } else {
//                   // For primitive types (string, number, boolean)
//                   displayValue = String(value);
//                 }

//                 return (
//                   <div
//                     key={key}
//                     className="flex items-center gap-2 bg-white p-2 rounded-md border border-gray-200 shadow-sm transition-all"
//                   >
//                     <div className="w-2 h-2 rounded-full bg-blue-500"></div>
//                     <div className="text-xs">
//                       <span className="text-zinc-500 font-light capitalize">
//                         {key.replace(/_/g, ' ')}: {/* Nicely format key for display */}
//                       </span>{" "}
//                       <span
//                         className={
//                           displayValue && displayValue !== "null" && displayValue !== "undefined"
//                             ? "text-zinc-900 font-light break-words" // Added break-words for long strings
//                             : "text-gray-400 italic"
//                         }
//                       >
//                         {displayValue || "N/A"}
//                       </span>
//                     </div>
//                   </div>
//                 );
//               })
//             ) : (
//               <div className="col-span-2 text-gray-500 italic p-2">No active context details.</div>
//             )}
//           </div>
//         </CardContent>
//       </Card>
//     </PanelSection>
//   );
// }
