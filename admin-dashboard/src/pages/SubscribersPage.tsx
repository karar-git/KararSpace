import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Trash2, Mail } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
}

export function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [subscribersData, countData] = await Promise.all([
        api.getSubscribers(),
        api.getSubscriberCount(),
      ]);
      setSubscribers(subscribersData);
      setCount(countData.count);
    } catch (error) {
      console.error('Failed to load subscribers:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this subscriber?')) return;
    try {
      await api.deleteSubscriber(id);
      loadData();
    } catch (error) {
      console.error('Failed to delete subscriber:', error);
    }
  }

  if (loading) return <div className="text-zinc-500">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Subscribers</h1>
          <p className="text-zinc-500 mt-1">
            {count} {count === 1 ? 'person' : 'people'} subscribed to notifications
          </p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {subscribers.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            No subscribers yet.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {subscribers.map((subscriber) => (
              <div
                key={subscriber.id}
                className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                    <Mail size={18} className="text-zinc-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{subscriber.email}</p>
                    <p className="text-zinc-500 text-sm">
                      Subscribed {new Date(subscriber.subscribedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(subscriber.id)}
                  className="p-2 text-zinc-500 hover:text-red-400 transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {subscribers.length > 0 && (
        <div className="mt-6 p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
          <p className="text-sm text-zinc-400">
            <strong className="text-zinc-300">Note:</strong> When you publish new articles or projects, 
            you can manually send email notifications to these subscribers using an email service.
          </p>
        </div>
      )}
    </div>
  );
}
