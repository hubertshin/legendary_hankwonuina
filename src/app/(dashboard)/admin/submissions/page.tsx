"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, ArrowUp, ArrowDown, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { formatPhoneNumber } from "@/lib/event-utils";

type SortField = 'createdAt' | 'name' | 'birthDate' | 'phone';
type SortDirection = 'asc' | 'desc';

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/admin/submissions?limit=100');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setSubmissions(data.submissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter submissions by search query
  const filteredSubmissions = submissions.filter((submission) => {
    // Search filter
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const name = submission.name?.toLowerCase() || '';
    const phone = submission.phone || '';

    return name.includes(query) || phone.includes(query);
  });

  // Sort filtered submissions
  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'createdAt':
      case 'birthDate':
        aValue = new Date(a[sortField]).getTime();
        bValue = new Date(b[sortField]).getTime();
        break;
      default:
        aValue = a[sortField];
        bValue = b[sortField];
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedSubmissions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSubmissions = sortedSubmissions.slice(startIndex, endIndex);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="text-center py-12">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">무료 자서전 신청자 관리</h1>
        <p className="text-muted-foreground">
          총 {submissions.length}명의 신청자
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex justify-end">
        <div>
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="이름 또는 전화번호로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-2 text-right">
              {filteredSubmissions.length}개의 결과를 찾았습니다.
            </p>
          )}
        </div>
      </div>

      {/* Submissions Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8"
                    onClick={() => handleSort('createdAt')}
                  >
                    제출일
                    {sortField === 'createdAt' && (
                      sortDirection === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                    )}
                    {sortField !== 'createdAt' && <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8"
                    onClick={() => handleSort('name')}
                  >
                    이름
                    {sortField === 'name' && (
                      sortDirection === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                    )}
                    {sortField !== 'name' && <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8"
                    onClick={() => handleSort('birthDate')}
                  >
                    생년월일
                    {sortField === 'birthDate' && (
                      sortDirection === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                    )}
                    {sortField !== 'birthDate' && <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8"
                    onClick={() => handleSort('phone')}
                  >
                    전화번호
                    {sortField === 'phone' && (
                      sortDirection === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                    )}
                    {sortField !== 'phone' && <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />}
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSubmissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    신청 내역이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSubmissions.map((submission) => {
                  return (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <div>
                          <div>{new Date(submission.createdAt).toLocaleDateString("ko-KR")}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(submission.createdAt).toLocaleTimeString("ko-KR", {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {submission.name}
                      </TableCell>
                      <TableCell>
                        {new Date(submission.birthDate).toLocaleDateString("ko-KR")}
                      </TableCell>
                      <TableCell>{formatPhoneNumber(submission.phone)}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex gap-1">
              {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, current page, and pages around current
                const showPage =
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1);

                if (!showPage) {
                  // Show ellipsis
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="px-2 py-1 text-muted-foreground">
                        ...
                      </span>
                    );
                  }
                  return null;
                }

                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="min-w-[2.5rem]"
                  >
                    {page}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
