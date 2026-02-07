import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import Message from './Message'

const ChatBox = () => {
  const { selectedChat, theme } = useAppContext()
  const [messages, setMessages] = useState([])

  useEffect(() => {
    if (selectedChat?.messages) {
      setMessages(selectedChat.messages)
    }
  }, [selectedChat])

  return (
    <div className="flex-1 flex flex-col m-5 md:m-10 xl:mx-30 max-md:mt-14 2xl:pr-40">
      <div className="flex-1 mb-5 overflow-y-scroll">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-primary">
            <div className="flex mr-9">
              <img
                src={assets.logo}
                alt=""
                className="w-full max-w-56 sm:max-w-68"
              />
              <div>
                <p className="ml-2 text-5xl">MJGPT</p>
                <p className="ml-2 text-xl">Intelligent AI Assistant</p>
              </div>
            </div>
            <p className="mt-5 text-4xl sm:text-6xl text-center text-gray-400">
              Ask me anything.
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}
      </div>
    </div>
  )
}

export default ChatBox
