import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Activity, Download, Search, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Helmet } from 'react-helmet';

const ActivityLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState(new Set());
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('activity_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (moduleFilter !== 'ALL') query = query.eq('module', moduleFilter);
      if (actionFilter !== 'ALL') query = query.eq('action', actionFilter);
      if (searchTerm) query = query.ilike('description', `%${searchTerm}%`);

      const { data, error } = await query;
      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('activity_logs_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs' }, (payload) => {
        if (page === 1) { // Only add to top if on first page
          setLogs(prev => [payload.new, ...prev].slice(0, pageSize));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [page, moduleFilter, actionFilter, searchTerm]);

  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedRows(newExpanded);
  };

  const exportCSV = () => {
    if (!logs.length) return;
    const headers = ['Date', 'User', 'Email', 'Action', 'Module', 'Entity Type', 'Description'];
    const csvContent = [
      headers.join(','),
      ...logs.map(log => [
        `"${format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}"`,
        `"${log.user_name || ''}"`,
        `"${log.user_email || ''}"`,
        `"${log.action || ''}"`,
        `"${log.module || ''}"`,
        `"${log.entity_type || ''}"`,
        `"${(log.description || '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `activity_logs_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <Helmet><title>Activity Log - Admin - APEX Hub</title></Helmet>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#1B4D5C] p-3 rounded-xl shadow-md">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Activity Log</h1>
            <p className="text-gray-500">Monitor all user actions across the platform</p>
          </div>
        </div>
        <Button onClick={exportCSV} variant="outline" className="gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader className="bg-gray-50/50 pb-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search descriptions..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-gray-900"
              />
            </div>
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Modules" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Modules</SelectItem>
                <SelectItem value="AUTH">Authentication</SelectItem>
                <SelectItem value="SALES">Sales</SelectItem>
                <SelectItem value="EXPENSES">Expenses</SelectItem>
                <SelectItem value="SETTINGS">Settings</SelectItem>
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Actions</SelectItem>
                <SelectItem value="LOGIN">Login</SelectItem>
                <SelectItem value="LOGOUT">Logout</SelectItem>
                <SelectItem value="CREATE">Create</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading && logs.length === 0 ? (
            <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#1B4D5C]" /></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">No activity logs available.</TableCell></TableRow>
                  ) : (
                    logs.map(log => (
                      <React.Fragment key={log.id}>
                        <TableRow className="cursor-pointer hover:bg-gray-50" onClick={() => toggleRow(log.id)}>
                          <TableCell>
                            {expandedRows.has(log.id) ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium text-gray-900">{log.user_name || 'System'}</div>
                            <div className="text-xs text-gray-500">{log.user_email}</div>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              log.action === 'CREATE' ? 'bg-green-100 text-green-700' :
                              log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' :
                              log.action === 'DELETE' ? 'bg-red-100 text-red-700' :
                              log.action === 'LOGIN' ? 'bg-purple-100 text-purple-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {log.action}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">{log.module}</TableCell>
                          <TableCell className="text-sm text-gray-900 max-w-md truncate">{log.description}</TableCell>
                        </TableRow>
                        {expandedRows.has(log.id) && (
                          <TableRow className="bg-gray-50/50">
                            <TableCell colSpan={6} className="p-0 border-b">
                              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">Details</h4>
                                  <div className="space-y-1 text-gray-600">
                                    <p><strong>Entity Type:</strong> {log.entity_type || 'N/A'}</p>
                                    <p><strong>Entity Name:</strong> {log.entity_name || 'N/A'}</p>
                                    <p><strong>Description:</strong> {log.description}</p>
                                  </div>
                                </div>
                                {log.new_values && (
                                  <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">New Values</h4>
                                    <pre className="bg-white p-3 rounded border text-xs text-gray-800 overflow-x-auto">
                                      {JSON.stringify(log.new_values, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="flex justify-between items-center px-4">
        <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading}>Previous Page</Button>
        <span className="text-sm text-gray-500">Page {page}</span>
        <Button variant="outline" onClick={() => setPage(p => p + 1)} disabled={logs.length < pageSize || loading}>Next Page</Button>
      </div>
    </div>
  );
};

export default ActivityLogPage;