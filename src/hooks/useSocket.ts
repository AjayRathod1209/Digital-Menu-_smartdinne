'use client'

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const socketInstance = io()
    
    socketInstance.on('connect', () => {
      console.log('Connected to WebSocket server')
      setIsConnected(true)
    })

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from WebSocket server')
      setIsConnected(false)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  const joinOrderRoom = (orderId: string) => {
    if (socket) {
      socket.emit('joinOrderRoom', orderId)
    }
  }

  const joinAdminRoom = () => {
    if (socket) {
      socket.emit('joinAdminRoom')
    }
  }

  const updateOrderStatus = (orderId: string, status: string) => {
    if (socket) {
      socket.emit('updateOrderStatus', { orderId, status })
    }
  }

  const notifyNewOrder = (orderData: any) => {
    if (socket) {
      socket.emit('newOrder', orderData)
    }
  }

  const onOrderStatusUpdate = (callback: (data: any) => void) => {
    if (socket) {
      socket.on('orderStatusUpdate', callback)
    }
  }

  const onNewOrder = (callback: (data: any) => void) => {
    if (socket) {
      socket.on('newOrder', callback)
    }
  }

  return {
    socket,
    isConnected,
    joinOrderRoom,
    joinAdminRoom,
    updateOrderStatus,
    notifyNewOrder,
    onOrderStatusUpdate,
    onNewOrder
  }
}