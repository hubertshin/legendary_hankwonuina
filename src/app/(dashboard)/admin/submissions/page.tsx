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
import { ArrowUpDown, ArrowUp, ArrowDown, Search, ChevronLeft, ChevronRight, Trash2, Loader2 } from "lucide-react";
import { formatPhoneNumber } from "@/lib/event-utils";
import { CallLogCell } from "@/components/admin/call-log-cell";
import { NotifyStatusCell } from "@/components/admin/notify-status-cell";

type SortField = 'createdAt' | 'name' | 'preferredSlotAt' | 'phone';
type SortDirection = 'asc' | 'desc';

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // 선택 삭제
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setConfirmDelete(false);
  };

  /** 현재 페이지 전체 선택/해제. 보이지 않는 항목까지 지우는 사고를 막으려고
      전체가 아니라 **현재 페이지**만 대상으로 한다. */
  const togglePageSelection = (ids: string[], checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (checked ? next.add(id) : next.delete(id)));
      return next;
    });
    setConfirmDelete(false);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const response = await fetch('/api/admin/submissions/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setDeleteError(data?.error ?? '삭제하지 못했습니다.');
        return;
      }
      setSelectedIds(new Set());
      setConfirmDelete(false);
      await fetchSubmissions();
    } catch {
      setDeleteError('네트워크 오류로 삭제되지 않았습니다.');
    } finally {
      setIsDeleting(false);
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

  // "8월 18일 (화) 오후 3시" — 상담사가 한눈에 읽을 형식
function formatSlotLabel(value: string | Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
}

// Sort filtered submissions
  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'createdAt':
        aValue = new Date(a[sortField]).getTime();
        bValue = new Date(b[sortField]).getTime();
        break;
      case 'preferredSlotAt':
        // 시간 미정("아무 때나") 건은 항상 뒤로 보낸다. 정렬 방향과 무관하게
        // 날짜가 있는 건이 먼저 보여야 오늘 통화할 목록을 찾기 쉽다.
        aValue = a.preferredSlotAt ? new Date(a.preferredSlotAt).getTime() : Number.MAX_SAFE_INTEGER;
        bValue = b.preferredSlotAt ? new Date(b.preferredSlotAt).getTime() : Number.MAX_SAFE_INTEGER;
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

      {/* 선택 삭제 바 — 선택했을 때만 나타난다 */}
      {selectedIds.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3">
          <span className="font-medium">{selectedIds.size}건 선택됨</span>

          {confirmDelete ? (
            <>
              {/* 되돌릴 수 없는 작업이라 한 번 더 확인받는다 */}
              <span className="text-sm text-destructive">
                삭제하면 되돌릴 수 없습니다. 정말 삭제하시겠어요?
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={isDeleting}
              >
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {selectedIds.size}건 삭제
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmDelete(false)}
                disabled={isDeleting}
              >
                취소
              </Button>
            </>
          ) : (
            <>
              <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                선택 삭제
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
                선택 해제
              </Button>
            </>
          )}

          {deleteError && (
            <span role="alert" className="text-sm text-destructive">
              {deleteError}
            </span>
          )}
        </div>
      )}

      {/* Submissions Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    aria-label="이 페이지 전체 선택"
                    className="h-4 w-4 cursor-pointer"
                    checked={
                      paginatedSubmissions.length > 0 &&
                      paginatedSubmissions.every((s: any) => selectedIds.has(s.id))
                    }
                    onChange={(e) =>
                      togglePageSelection(
                        paginatedSubmissions.map((s: any) => s.id),
                        e.target.checked
                      )
                    }
                  />
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8"
                    onClick={() => handleSort('createdAt')}
                  >
                    신청일
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
                    신청자
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
                    onClick={() => handleSort('preferredSlotAt')}
                  >
                    희망 통화
                    {sortField === 'preferredSlotAt' && (
                      sortDirection === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                    )}
                    {sortField !== 'preferredSlotAt' && <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />}
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
                <TableHead>구분</TableHead>
                <TableHead>알림</TableHead>
                <TableHead className="min-w-[16rem]">통화 기록 · 메모</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSubmissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    신청 내역이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSubmissions.map((submission) => {
                  return (
                    <TableRow
                      key={submission.id}
                      data-state={selectedIds.has(submission.id) ? "selected" : undefined}
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          aria-label={`${submission.name} 선택`}
                          className="h-4 w-4 cursor-pointer"
                          checked={selectedIds.has(submission.id)}
                          onChange={() => toggleSelect(submission.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{new Date(submission.createdAt).toLocaleDateString("ko-KR", { timeZone: 'Asia/Seoul' })}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(submission.createdAt).toLocaleTimeString("ko-KR", {
                              timeZone: 'Asia/Seoul',
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
                        {submission.preferredSlotAt ? (
                          <span className="font-medium">
                            {formatSlotLabel(submission.preferredSlotAt)}
                          </span>
                        ) : submission.anyTimeOk ? (
                          // 배정하지 않으면 신청자가 아무 연락도 못 받는다. 눈에 띄게 표시한다.
                          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900">
                            아무 때나 · 배정 필요
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>{formatPhoneNumber(submission.phone)}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {submission.subjectType ?? '—'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <NotifyStatusCell
                          notifiedAt={submission.notifiedAt ?? null}
                          notifyError={submission.notifyError ?? null}
                        />
                      </TableCell>
                      <TableCell>
                        <CallLogCell
                          id={submission.id}
                          callResult={submission.callResult ?? null}
                          calledAt={submission.calledAt ?? null}
                          adminNotes={submission.adminNotes ?? null}
                          onChanged={fetchSubmissions}
                        />
                      </TableCell>
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
