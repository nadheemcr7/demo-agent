# python-backend/agents_archive/airline_agents_definitions.py

# This file contains the backup definitions for airline-related agents, tools, and hooks.
# It is designed to be a self-contained backup.
# To re-integrate these agents, copy their definitions back into main.py
# and ensure all necessary context and guardrail imports/definitions are in place there.

from __future__ import annotations as _annotations

from typing import Optional, List, Dict, Any
from datetime import date, datetime

# Import shared context type from shared_types.py
from shared_types import AirlineAgentContext # Import the shared context model
from database import db_client # Assumes db_client is accessible or imported from a shared module
from agents import (
    Agent,
    RunContextWrapper,
    function_tool,
    handoff,
)
from agents.extensions.handoff_prompt import RECOMMENDED_PROMPT_PREFIX

# =========================
# TOOLS (Airline-specific)
# =========================

@function_tool(
    name_override="faq_lookup_tool", description_override="Lookup frequently asked questions."
)
async def faq_lookup_tool(question: str) -> str:
    """Lookup answers to frequently asked questions about airline policies."""
    q = question.lower()
    if "bag" in q or "baggage" in q:
        return (
            "You are allowed to bring one bag on the plane. "
            "It must be under 50 pounds and 22 inches x 14 inches x 9 inches."
            "Please note that additional baggage may incur extra charges."
        )
    elif "seats" in q or "plane" in q:
        return (
            "There are 120 seats on the plane. "
            "There are 22 business class seats and 98 economy seats. "
            "Exit rows are rows 4 and 16. "
            "Rows 5-8 are Economy Plus, with extra legroom."
            "For specific seat availability, please use the seat booking agent."
        )
    elif "wifi" in q:
        return "We have free wifi on the plane, join Airline-Wifi. Enjoy your flight!"
    return "I'm sorry, I don't know the answer to that question. Please try rephrasing or ask about a different topic."

@function_tool
async def update_seat(
    context: RunContextWrapper[AirlineAgentContext], confirmation_number: str, new_seat: str
) -> str:
    """Update the seat for a given confirmation number."""
    success = await db_client.update_seat_number(confirmation_number, new_seat)
    if success:
        context.context.confirmation_number = confirmation_number # These context updates are now safe
        context.context.seat_number = new_seat
        return f"Successfully updated seat to {new_seat} for confirmation number {confirmation_number}. Is there anything else I can help you with regarding your seat or booking?"
    else:
        return f"Failed to update seat for confirmation number {confirmation_number}. Please double-check the confirmation number and the new seat, then try again. If the issue persists, please contact customer support."

@function_tool(
    name_override="flight_status_tool",
    description_override="Lookup status for a flight."
)
async def flight_status_tool(flight_number: str) -> str:
    """Lookup the status for a flight."""
    flight = await db_client.get_flight_status(flight_number)
    if flight:
        status = flight.get("current_status", "Unknown")
        gate = flight.get("gate", "TBD")
        terminal = flight.get("terminal", "TBD")
        delay = flight.get("delay_minutes")
        status_msg = f"Flight {flight_number} is {status}"
        if gate != "TBD":
            status_msg += f" and scheduled to depart from gate {gate}"
        if terminal != "TBD":
            status_msg += f" in terminal {terminal}"
        if delay:
            status_msg += f". The flight is delayed by {delay} minutes"
        return status_msg + ". Is there anything else I can help you with regarding this flight?"
    else:
        return f"Flight {flight_number} not found. Please double-check the flight number and try again."

@function_tool(
    name_override="get_booking_details",
    description_override="Get booking details by confirmation number."
)
async def get_booking_details(
    context: RunContextWrapper[AirlineAgentContext], confirmation_number: str
) -> str:
    """Get booking details from database."""
    booking = await db_client.get_booking_by_confirmation(confirmation_number)
    if booking:
        context.context.confirmation_number = confirmation_number # These context updates are now safe
        context.context.seat_number = booking.get("seat_number")
        context.context.booking_id = booking.get("id")
        customer = booking.get("customers")
        flight = booking.get("flights")
        if customer:
            context.context.passenger_name = customer.get("name")
            context.context.customer_id = customer.get("id")
            context.context.account_number = customer.get("account_number")
            context.context.customer_email = customer.get("email")
            context.context.is_conference_attendee = customer.get("is_conference_attendee", False)
            context.context.conference_name = customer.get("conference_name")
        if flight:
            context.context.flight_number = flight.get("flight_number")
            context.context.flight_id = flight.get("id")
        customer_name = customer.get('name') if customer else 'customer'
        flight_num = flight.get('flight_number') if flight else 'N/A'
        seat_num = booking.get('seat_number', 'N/A')
        return f"Found booking {confirmation_number} for {customer_name} on flight {flight_num}, seat {seat_num}. How else can I assist you with this booking?"
    else:
        return f"No booking found with confirmation number {confirmation_number}. Please double-check the confirmation number and try again."

@function_tool(
    name_override="display_seat_map",
    description_override="Display an interactive seat map to the customer so they can choose a new seat."
)
async def display_seat_map(
    context: RunContextWrapper[AirlineAgentContext]
) -> str:
    """Trigger the UI to show an interactive seat map to the customer."""
    return "DISPLAY_SEAT_MAP"

@function_tool(
    name_override="cancel_flight",
    description_override="Cancel a flight booking."
)
async def cancel_flight(
    context: RunContextWrapper[AirlineAgentContext]
) -> str:
    """Cancel the flight booking in the context."""
    confirmation_number = context.context.confirmation_number
    if not confirmation_number:
        return "No confirmation number found in context. Please ask the user for their confirmation number and use 'get_booking_details' first."
    
    success = await db_client.cancel_booking(confirmation_number)
    
    if success:
        flight_number = context.context.flight_number or "your flight"
        return f"Successfully cancelled {flight_number} with confirmation number {confirmation_number}. Is there anything else I can help you with today?"
    else:
        return f"Failed to cancel booking with confirmation number {confirmation_number}. Please contact customer service or verify the number."


# =========================
# HOOKS (Airline-specific)
# =========================

async def on_seat_booking_handoff_airline(context: RunContextWrapper[AirlineAgentContext]) -> None:
    """Load booking details when handed off to seat booking agent."""
    pass

async def on_cancellation_handoff_airline(context: RunContextWrapper[AirlineAgentContext]) -> None:
    """Load booking details when handed off to cancellation agent."""
    pass

async def on_flight_status_handoff_airline(context: RunContextWrapper[AirlineAgentContext]) -> None:
    """Load flight details when handed off to flight status agent."""
    pass

# =========================
# AGENTS (Airline-specific)
# =========================

def seat_booking_instructions_airline(
    run_context: RunContextWrapper[AirlineAgentContext], agent: Agent[AirlineAgentContext]
) -> str:
    ctx = run_context.context
    confirmation = ctx.confirmation_number or "[unknown]"
    current_seat = ctx.seat_number or "[unknown]"
    return (
        f"{RECOMMENDED_PROMPT_PREFIX}\n"
        "You are a seat booking agent. Help customers change their seat assignments.\n"
        f"Current booking details: Confirmation: {confirmation}, Current seat: {current_seat}\n"
        "Follow this process:\n"
        "1. If you don't have the confirmation number, ask the customer for it. Then, use the `get_booking_details` tool to fetch their booking. **Do not describe tool usage in your response.**\n"
        "2. Once you have booking details, if the user asks to view the seat map, use the `display_seat_map` tool. If they provide a seat number, use the `update_seat` tool. **Be direct and do not explain tool usage.**\n"
        "3. After a seat update, confirm the new seat to the user.\n"
        "If the customer asks unrelated questions, transfer back to the triage agent."
    )

seat_booking_agent_airline = Agent[AirlineAgentContext](
    name="Seat Booking Agent (Airline)",
    model="groq/llama3-8b-8192",
    handoff_description="A helpful agent that can update a seat on a flight.",
    instructions=seat_booking_instructions_airline,
    tools=[update_seat, display_seat_map, get_booking_details],
    # Guardrails are managed by the Triage Agent in main.py when these agents are active
    handoffs=[], # Handoffs back to triage are managed in main.py
)

def flight_status_instructions_airline(
    run_context: RunContextWrapper[AirlineAgentContext], agent: Agent[AirlineAgentContext]
) -> str:
    ctx = run_context.context
    confirmation = ctx.confirmation_number or "[unknown]"
    flight = ctx.flight_number or "[unknown]"
    return (
        f"{RECOMMENDED_PROMPT_PREFIX}\n"
        "You are a Flight Status Agent. Provide flight status information to customers.\n"
        f"Current details: Confirmation: {confirmation}, Flight: {flight}\n"
        "Follow this process:\n"
        "1. If you have a flight number, use flight_status_tool to get current status. **Do not describe tool usage.**\n"
        "2. If you only have confirmation number, use get_booking_details first to get flight number. **Do not describe tool usage.**\n"
        "3. If you have neither, ask the customer for their confirmation number or flight number.\n"
        "If the customer asks unrelated questions, transfer back to the triage agent."
    )

flight_status_agent_airline = Agent[AirlineAgentContext](
    name="Flight Status Agent (Airline)",
    model="groq/llama3-8b-8192",
    handoff_description="An agent to provide flight status information.",
    instructions=flight_status_instructions_airline,
    tools=[flight_status_tool, get_booking_details],
    # Guardrails are managed by the Triage Agent in main.py when these agents are active
    handoffs=[], # Handoffs back to triage are managed in main.py
)

def cancellation_instructions_airline(
    run_context: RunContextWrapper[AirlineAgentContext], agent: Agent[AirlineAgentContext]
) -> str:
    ctx = run_context.context
    confirmation = ctx.confirmation_number or "[unknown]"
    flight = ctx.flight_number or "[unknown]"
    return (
        f"{RECOMMENDED_PROMPT_PREFIX}\n"
        "You are a Cancellation Agent. Help customers cancel their flight bookings.\n"
        f"Current details: Confirmation: {confirmation}, Flight: {flight}\n"
        "Follow this process:\n"
        "1. If you don't have booking details, ask for confirmation number and use get_booking_details. **Do not describe tool usage.**\n"
        "2. Confirm the booking details with the customer before cancelling.\n"
        "3. Use cancel_flight tool to process the cancellation. **Do not describe tool usage.**\n"
        "If the customer asks unrelated questions, transfer back to the triage agent."
    )

cancellation_agent_airline = Agent[AirlineAgentContext](
    name="Cancellation Agent (Airline)",
    model="groq/llama3-8b-8169", # Increased context window
    handoff_description="An agent to cancel flights.",
    instructions=cancellation_instructions_airline,
    tools=[cancel_flight, get_booking_details],
    # Guardrails are managed by the Triage Agent in main.py when these agents are active
    handoffs=[], # Handoffs back to triage are managed in main.py
)

def faq_instructions_airline(
    run_context: RunContextWrapper[AirlineAgentContext], agent: Agent[AirlineAgentContext]
) -> str:
    return (
        f"{RECOMMENDED_PROMPT_PREFIX}\n"
        "You are an FAQ agent. Answer frequently asked questions about the airline.\n"
        "Use the faq_lookup_tool to get accurate answers. Do not rely on your own knowledge. **Do not describe tool usage.**\n"
        "If the customer asks questions outside of general airline policies, transfer back to the triage agent."
    )

faq_agent_airline = Agent[AirlineAgentContext](
    name="FAQ Agent (Airline)",
    model="groq/llama3-8b-8192",
    handoff_description="A helpful agent that can answer questions about the airline.",
    instructions=faq_instructions_airline,
    tools=[faq_lookup_tool],
    # Guardrails are managed by the Triage Agent in main.py when these agents are active
    handoffs=[], # Handoffs back to triage are managed in main.py
)
