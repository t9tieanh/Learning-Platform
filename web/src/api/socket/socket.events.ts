export enum SocketEvents {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  MESSAGE = 'message',
  JOIN_ROOM = 'join_room',
  NEW_USER = 'new_user',
}

export enum SocketEvents_CarePlan {
  CHANGE_STATUS = 'careplan_changeStatus',
  NOTIFICATE_CHANGE_STATUS = 'careplan_notificateChangeStatus',
}

// report
export enum SocketEvents_Report {
  CHANGE_STATUS = 'careplan_changeStatus',
}
