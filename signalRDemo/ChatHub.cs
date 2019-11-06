using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Channels;
using System.Threading.Tasks;

namespace signalRDemo
{
    //https://github.com/aspnet/AspNetCore/blob/master/src/SignalR/server/Core/src/Hub.cs
    public class ChatHub : Hub
    {
        //https://github.com/aspnet/AspNetCore/blob/master/src/SignalR/server/Core/src/HubLifetimeManager.cs
        public override async Task OnConnectedAsync()
        {
            //https://github.com/aspnet/AspNetCore/blob/9557630c0a470618b30679e8effcf019b1c74164/src/SignalR/server/Core/src/DefaultHubLifetimeManager.cs
            Console.WriteLine(Context.UserIdentifier);
            await Groups.AddToGroupAsync(Context.ConnectionId, "users");
            //https://github.com/aspnet/AspNetCore/blob/ec8304ae85d5a94cf3cd5efc5f89b986bc4eafd2/src/SignalR/server/Core/src/HubConnectionHandler.cs
            await base.OnConnectedAsync();
        }

        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
            //Send message to specific user
            //await Clients.User(user).SendAsync("ReceiveMessage", user, message);
        }

        public async Task SendGroup(string user, string groupName, string message)
        {
            await Clients.Group(groupName).SendAsync("ReceiveMessage", user, "[GROUP]: " + message);
        }

        public ChannelReader<string> ServerTimer(int count,
            int delay, CancellationToken token)
        {
            var channel = Channel.CreateUnbounded<string>();
            _ = WriteDateAsync(channel.Writer, token);
            return channel.Reader;
        }

        private async Task WriteDateAsync(ChannelWriter<string> writer, CancellationToken token)
        {
            try
            {
                while (true)
                {
                    token.ThrowIfCancellationRequested();
                    await writer.WriteAsync(DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fffffff"));
                    await Task.Delay(1, token);
                }
            }
            catch
            {
                writer.TryComplete();
            }
            writer.TryComplete();
        }


        public async Task StartTimer()
        {
            while (true)
            {
                await Clients.All.SendAsync("ReceiveStartTimer", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fffffff"));
                await Task.Delay(1);
            }
        }

        public async Task Func1()
        {
            await Clients.All.SendAsync("ReceiveFunc1");
        }

        public async Task Func2()
        {
            await Task.Delay(5000);
            await Clients.All.SendAsync("ReceiveFunc2");
        }

        public async Task VoteFirst()
        {
            await Clients.All.SendAsync("ReceiveVoteFirst");
        }

        public async Task VoteSecond()
        {
            await Clients.All.SendAsync("ReceiveVoteSecond");
        }
    }
}