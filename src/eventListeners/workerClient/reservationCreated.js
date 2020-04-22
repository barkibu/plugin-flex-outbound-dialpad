import { Actions, Notifications } from "@twilio/flex-ui";

var IsOutbound = false;

export function registerReservationCreatedExtensions(manager) {
  manager.workerClient.on("reservationCreated", handleReservationTask);
}

export function blockForOutboundCall() {
  console.log("OUTBOUND DIALPAD: Entering Outbound Only");
  IsOutbound = true;
}

export function unblockForOutBoundCall() {
  console.log("OUTBOUND DIALPAD: Exiting Outbound Only");
  IsOutbound = false;
}

function setAgentUnavailable() {
  Actions.invokeAction("SetActivity", {
    activityName: "Outbound Calls"
  })
    .then(() => {
      console.log("OUTBOUND DIALPAD: Agent is now on Outbound Calls");
    })
    .catch(error => {
      Actions.invokeAction("SetActivity", {
        activityName: "Offline"
      })
        .then(() => {
          console.log("OUTBOUND DIALPAD: Agent is now Offline");
        })
        .catch(() => {
          Notifications.showNotification("ActivityStateUnavailable", {
            state1: "Outbound Calls",
            state2: "Offline"
          });
        });
    });
}


function handleReservationTask(reservation) {
  if (IsOutbound) {
    if (
      reservation.task.taskChannelUniqueName === "voice" &&
      reservation.task.attributes.type === "outbound" &&
      reservation.task.attributes.autoAnswer === "true"
    ) {
      unblockForOutBoundCall()

      Actions.invokeAction("AcceptTask", {
        sid: reservation.sid
      }).then(() => {
        setTimeout(() => setAgentUnavailable(), 3000);
      });

      Actions.invokeAction("NavigateToView", {
        viewName: "agent-desktop"
      });

      Actions.invokeAction("SelectTask", {
        sid: reservation.sid
      });

    } else if (reservation.task.taskChannelUniqueName === "voice") {
      Actions.invokeAction("RejectTask", {
        sid: reservation.sid
      });
    }
  }
}
