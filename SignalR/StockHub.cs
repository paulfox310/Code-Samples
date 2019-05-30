using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;
using System.Timers;
using BigMoney.Services;
using BigMoney.Models.Domain;

namespace Hubs
{
    public class StockHub : Hub
    {
        private IStocksService _stocks;

        public StockHub(IStocksService stocks)
        {
            _stocks = stocks;
        }

        private static Timer aTimer;

        public Task Stocks()
        {
            GroupStock stocks = _crawling.Stocks();
			aTimer.Start();
            return Clients.All.SendAsync("ReceiveStocks", stocks);
        }

        public override async Task OnConnectedAsync()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "SignalR Users");
            await base.OnConnectedAsync();
            StartTimer();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, "SignalR Users");
            await base.OnDisconnectedAsync(exception);
            CloseStocks();
        }

        public void CloseStocks()
        {
            aTimer.Stop();
            aTimer.Dispose();
        }

        public void StartTimer()
        {
            aTimer = new Timer(30000);
            aTimer.Elapsed += OnTimedEvent;
            aTimer.AutoReset = true;
            aTimer.Enabled = true;
        }

        public void OnTimedEvent(Object source, ElapsedEventArgs e)
        {
			aTimer.Stop();
            Stocks();
        }
    }
}