import Array "mo:core/Array";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";

actor {
  type Reservation = {
    id : Nat;
    name : Text;
    phone : Text;
    service : Text;
    message : Text;
    timestamp : Int;
  };

  module Reservation {
    public func compare(res1 : Reservation, res2 : Reservation) : Order.Order {
      Nat.compare(res1.id, res2.id);
    };
  };

  var availableSlots = 10;
  var reservations = Array.empty<Reservation>();

  public shared ({ caller }) func makeReservation(name : Text, phone : Text, service : Text, message : Text) : async Nat {
    if (availableSlots == 0) {
      Runtime.trap("No available slots remaining");
    };

    let newId = reservations.size() + 1;
    let reservation : Reservation = {
      id = newId;
      name;
      phone;
      service;
      message;
      timestamp = Time.now();
    };

    reservations := reservations.concat([reservation]);
    availableSlots -= 1;
    reservation.id;
  };

  public query ({ caller }) func getAvailableSlots() : async Nat {
    availableSlots;
  };

  public query ({ caller }) func getReservations() : async [Reservation] {
    reservations.sort();
  };

  public shared ({ caller }) func resetSlots(n : Nat) : async () {
    availableSlots := n;
  };
};
