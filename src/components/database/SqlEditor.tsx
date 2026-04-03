import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Play, Save, Database, Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@supabase/supabase-js';
import SyntaxHighlighter from './SyntaxHighlighter';

interface QueryResult {
  data: any[];
  error: string | null;
  executionTime: number;
  rowCount: number;
}

interface SavedQuery {
  id: string;
  name: string;
  query: string;
  createdAt: string;
}

const SqlEditor: React.FC = () => {
  const [query, setQuery] = useState<string>('-- SQL Query Editor\n-- Ketik query SQL di sini\n\nSELECT * FROM users LIMIT 10;');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const [queryName, setQueryName] = useState<string>('');
  const { toast } = useToast();

  // Inisialisasi Supabase client
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL || '',
    import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  );

  const executeQuery = useCallback(async () => {
    if (!query.trim()) {
      toast({
        title: "Error",
        description: "Query tidak boleh kosong",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const startTime = performance.now();

    try {
      // Menggunakan Supabase RPC untuk eksekusi query SQL
      const { data, error } = await supabase.rpc('execute_sql', { 
        sql_query: query 
      });

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      if (error) {
        setResult({
          data: [],
          error: error.message,
          executionTime,
          rowCount: 0,
        });
        toast({
          title: "Query Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setResult({
          data: data || [],
          error: null,
          executionTime,
          rowCount: Array.isArray(data) ? data.length : 0,
        });
        toast({
          title: "Query Berhasil",
          description: `Query berhasil dieksekusi dalam ${executionTime.toFixed(2)}ms`,
        });
      }
    } catch (err) {
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      setResult({
        data: [],
        error: err instanceof Error ? err.message : 'Unknown error',
        executionTime,
        rowCount: 0,
      });
      
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Terjadi kesalahan',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [query, supabase, toast]);

  const saveQuery = useCallback(() => {
    if (!query.trim()) {
      toast({
        title: "Error",
        description: "Query tidak boleh kosong",
        variant: "destructive",
      });
      return;
    }

    if (!queryName.trim()) {
      toast({
        title: "Error",
        description: "Nama query harus diisi",
        variant: "destructive",
      });
      return;
    }

    const newQuery: SavedQuery = {
      id: Date.now().toString(),
      name: queryName,
      query: query,
      createdAt: new Date().toISOString(),
    };

    const updatedQueries = [...savedQueries, newQuery];
    setSavedQueries(updatedQueries);
    
    // Save to localStorage
    localStorage.setItem('savedQueries', JSON.stringify(updatedQueries));
    
    toast({
      title: "Query Disimpan",
      description: `Query "${queryName}" telah disimpan`,
    });
    
    setQueryName('');
  }, [query, queryName, savedQueries, toast]);

  const loadQuery = useCallback((savedQuery: SavedQuery) => {
    setQuery(savedQuery.query);
    setQueryName(savedQuery.name);
    toast({
      title: "Query Dimuat",
      description: `Query "${savedQuery.name}" telah dimuat`,
    });
  }, [toast]);

  const deleteQuery = useCallback((id: string) => {
    const updatedQueries = savedQueries.filter(q => q.id !== id);
    setSavedQueries(updatedQueries);
    localStorage.setItem('savedQueries', JSON.stringify(updatedQueries));
    toast({
      title: "Query Dihapus",
      description: "Query telah dihapus",
    });
  }, [savedQueries, toast]);

  const exportQueries = useCallback(() => {
    const dataStr = JSON.stringify(savedQueries, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'sql-queries.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Query Diekspor",
      description: "Semua query telah diekspor",
    });
  }, [savedQueries, toast]);

  const importQueries = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedQueries = JSON.parse(e.target?.result as string);
        setSavedQueries(importedQueries);
        localStorage.setItem('savedQueries', JSON.stringify(importedQueries));
        toast({
          title: "Query Diimpor",
          description: "Query berhasil diimpor",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Format file tidak valid",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  }, [toast]);

  // Load saved queries from localStorage on mount
  React.useEffect(() => {
    const stored = localStorage.getItem('savedQueries');
    if (stored) {
      try {
        setSavedQueries(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading saved queries:', error);
      }
    }
  }, []);

  const renderResultTable = useCallback(() => {
    if (!result || result.data.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Database className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>Tidak ada data untuk ditampilkan</p>
        </div>
      );
    }

    const columns = Object.keys(result.data[0]);

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              {columns.map((column) => (
                <th
                  key={column}
                  className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.data.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td
                    key={column}
                    className="border border-gray-300 px-4 py-2 text-gray-600"
                  >
                    {row[column] === null ? (
                      <span className="text-gray-400 italic">NULL</span>
                    ) : row[column] === '' ? (
                      <span className="text-gray-400 italic">EMPTY</span>
                    ) : (
                      String(row[column])
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }, [result]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            SQL Editor for Supabase
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="editor" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="saved">Saved Queries</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ketik query SQL di sini..."
                    className="min-h-[200px] font-mono text-sm"
                    spellCheck={false}
                  />
                  <div className="absolute top-2 right-2 pointer-events-none">
                    <SyntaxHighlighter value={query} className="font-mono text-sm opacity-50" />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    onClick={executeQuery}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    {isLoading ? 'Executing...' : 'Execute Query'}
                  </Button>
                  
                  <div className="flex items-center gap-2 ml-auto">
                    <input
                      type="text"
                      value={queryName}
                      onChange={(e) => setQueryName(e.target.value)}
                      placeholder="Nama query..."
                      className="px-3 py-1 border rounded text-sm"
                    />
                    <Button
                      onClick={saveQuery}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </Button>
                  </div>
                </div>
              </div>

              {result && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Query Results</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {result.rowCount} rows
                        </Badge>
                        <Badge variant="outline">
                          {result.executionTime.toFixed(2)}ms
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {result.error && (
                      <Alert className="mb-4">
                        <AlertDescription className="text-red-600">
                          {result.error}
                        </AlertDescription>
                      </Alert>
                    )}
                    {renderResultTable()}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="saved" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Saved Queries</h3>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={exportQueries}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                  <label className="cursor-pointer">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      asChild
                    >
                      <span>
                        <Upload className="h-4 w-4" />
                        Import
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept=".json"
                      onChange={importQueries}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              
              <div className="space-y-2">
                {savedQueries.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Belum ada query yang disimpan
                  </p>
                ) : (
                  savedQueries.map((savedQuery) => (
                    <Card key={savedQuery.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{savedQuery.name}</h4>
                            <p className="text-sm text-gray-600 truncate">
                              {savedQuery.query}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(savedQuery.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => loadQuery(savedQuery)}
                              variant="outline"
                              size="sm"
                            >
                              Load
                            </Button>
                            <Button
                              onClick={() => deleteQuery(savedQuery.id)}
                              variant="destructive"
                              size="sm"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Database Connection</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Supabase URL
                    </label>
                    <input
                      type="text"
                      value={import.meta.env.VITE_SUPABASE_URL || ''}
                      readOnly
                      className="w-full px-3 py-2 border rounded bg-gray-50"
                      placeholder="VITE_SUPABASE_URL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Supabase Anon Key
                    </label>
                    <input
                      type="password"
                      value={import.meta.env.VITE_SUPABASE_ANON_KEY || ''}
                      readOnly
                      className="w-full px-3 py-2 border rounded bg-gray-50"
                      placeholder="VITE_SUPABASE_ANON_KEY"
                    />
                  </div>
                  <Alert>
                    <AlertDescription>
                      Pastikan Anda telah membuat function `execute_sql` di Supabase untuk menjalankan query SQL.
                      Lihat file supabase-setup.sql untuk contoh implementasi.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SqlEditor;
