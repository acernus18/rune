## Cost Functions

```vb
Function CostEncode(V)
    'Variables Declare
    Dim Suffix, Codes, InputArray() As Variant, BeginRecording As Boolean, Result() As String, ResultCount
    'Varibales Initailization
    Suffix = Array("A", "B", "C", "D", "E", "F")
    Codes = Array("V", "H", "K", "L", "M", "N", "R", "S", "T", "U")
    BeginRecording = False
    ResultCount = 0
    'Initial Input Array
    ReDim Preserve InputArray(Len(V))
    For i = 1 To Len(V)
        InputArray(i - 1) = Mid(V, i, 1)
    Next
    For i = Len(V) - 1 To 0 Step -1
        If InputArray(i) <> "0" Or BeginRecording Then
            BeginRecording = True
            ResultCount = ResultCount + 1
            ReDim Preserve Result(ResultCount)
            Result(ResultCount - 1) = Codes(CInt(InputArray(i)))
        End If
    Next
    Result(0) = Suffix(Len(V) - 1)
    CostEncode = StrReverse(Join(Result, ""))
End Function

Function CostDecode(V)
    If V = "" Then
        CostDecode = 0
    End If
    Dim Codes, InputArray() As Variant, Result
    Codes = Array("V", "H", "K", "L", "M", "N", "R", "S", "T", "U", "A", "B", "C", "D", "E", "F")
    Result = 0
    ReDim Preserve InputArray(Len(V))
    For i = 1 To Len(V)
        InputArray(i - 1) = Mid(V, i, 1)
    Next
    For i = 0 To Len(V)
        Dim Index As Integer
        Index = -1
        For j = 0 To 15
            If Codes(j) = InputArray(i) Then
                Index = j
                Exit For
            End If
        Next
        If Index = -1 Then
            Exit For
        End If
        If Index > 9 Then
            Result = Result * 10 ^ (Index - 9 - Len(Result))
            Exit For
        Else
            Result = Result * 10 + Index
        End If
    Next
    CostDecode = Result
End Function
```