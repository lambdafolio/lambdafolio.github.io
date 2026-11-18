---
title: "VBScript"
name: "VBScript"
homepage: "https://learn.microsoft.com/en-us/previous-versions/t0aew7h6(v=vs.85)"
references:
  - url: "https://learn.microsoft.com/en-us/previous-versions/4y5y7bh5(v=vs.85)"
    title: "VBScript Version Information — Microsoft Learn (archived language reference)"
  - url: "https://learn.microsoft.com/en-us/previous-versions/23t9k18c(v=vs.85)"
    title: "Class Object (VBScript) — Microsoft Learn"
  - url: "https://learn.microsoft.com/en-us/previous-versions/4ah5852c(v=vs.85)"
    title: "Class Statement (VBScript) — Microsoft Learn"
  - url: "https://learn.microsoft.com/en-us/previous-versions/dcw63t7z(v=vs.85)"
    title: "CreateObject Function (VBScript) — Microsoft Learn"
  - url: "https://learn.microsoft.com/en-us/previous-versions/53f3k80h(v=vs.85)"
    title: "On Error Statement (VBScript) — Microsoft Learn"
  - url: "https://learn.microsoft.com/en-us/previous-versions/yab2dx62(v=vs.85)"
    title: "Regular Expression (RegExp) Object (VBScript) — Microsoft Learn"
  - url: "https://learn.microsoft.com/en-us/office/vba/outlook/how-to/using-visual-basic-to-customize-outlook-forms/variants-supported-in-vbscript"
    title: "Variants Supported in VBScript — Microsoft Learn"
  - url: "https://techcommunity.microsoft.com/blog/windows-itpro-blog/vbscript-deprecation-timelines-and-next-steps/4148301"
    title: "VBScript deprecation: Timelines and next steps — Windows IT Pro Blog"
  - url: "https://learn.microsoft.com/en-us/windows/whats-new/deprecated-features"
    title: "Deprecated features in the Windows client — Microsoft Learn"
author: "Microsoft"
kind: "dialect"
status: "dormant"
year: 1996
paradigms:
  - "imperative"
  - "object-based"
typing: "dynamic"
execution:
  - "interpreted"
features:
  - "variant-type"
  - "late-binding"
  - "com-automation"
  - "error-handling"
  - "regex"
influences:
  - "Visual Basic"
relations:
  - name: "Visual Basic"
    kind: "dialect-of"
  - name: "Visual Basic for Applications"
    kind: "shares-ancestor-with"
note: "Microsoft's scripting subset of Visual Basic for Internet Explorer, IIS and the Windows Script Host. One Variant data type, late-bound COM automation, and classes without inheritance; deprecated since 2023 and on a phased removal path."
---
## Overview

VBScript is Microsoft's scripting subset of [Visual Basic](/languages/visual-basic), embedded in Internet Explorer, IIS, and the Windows Script Host so a
web page or an administrator's `.vbs` file could drive COM objects. It traded
Visual Basic's declared types for a single [Variant](https://learn.microsoft.com/en-us/office/vba/outlook/how-to/using-visual-basic-to-customize-outlook-forms/variants-supported-in-vbscript),
and its classes stop short of inheritance — a trim that leaves it
[object-based](/paradigms/object-based) rather than object-oriented.

## Code

::code-group

```vbscript [primitives]
Option Explicit

Dim total, greeting
total = 42                        ' Integer subtype, assigned at run time
greeting = "VBScript " & 5.8      ' & coerces the number to a string
WScript.Echo TypeName(total / 4) & " " & (total / 4)   ' Double 10.5
```

```vbscript [combinations]
Dim langs, entry
langs = Array("1.0", "5.0", "5.8")    ' a Variant array, lower bound 0
WScript.Echo (UBound(langs) - LBound(langs) + 1) & " entries"
For Each entry In langs               ' iteration consumes the array
    WScript.Echo entry
Next
```

```vbscript [abstractions]
Class Counter
    Private m_count
    Private Sub Class_Initialize
        m_count = 0
    End Sub
    Public Sub Increment(step)
        m_count = m_count + step
    End Sub
    Public Property Get Value
        Value = m_count
    End Property
End Class

Dim c
Set c = New Counter
c.Increment 2
WScript.Echo c.Value              ' 2
```

```vbscript [idioms]
' late binding and inline error handling: no type library, no try/catch.
On Error Resume Next
Dim fso
Set fso = CreateObject("Scripting.FileSystemObject")
If Err.Number <> 0 Then
    WScript.Echo "missing host library: " & Err.Description
Else
    WScript.Echo "exists: " & fso.FileExists("C:\missing.txt")
    Set fso = Nothing
End If
On Error GoTo 0
```

::

::note
Every value is a Variant, so `TypeName` reports the subtype the run time chose;
  arrays are addressed by `LBound`/`UBound`; `Class` gives properties and private
  members but no base-class clause, which is why reuse is written as an object
  held and forwarded; and COM automation is late bound, so `On Error Resume Next`
  plus the `Err` object is the whole failure story.
::

## Distinctive traits

- One data type: every variable is a Variant, and the run time picks the
  subtype, so no declaration prevents a string from reaching an arithmetic
  operator.
- Late binding only: `CreateObject` resolves a ProgID at run time, so a script
  needs no type library and no compile step.
- [Classes](https://learn.microsoft.com/en-us/previous-versions/4ah5852c%28v=vs.85%29)
  have no base-class clause: `Class`/`End Class` yields properties, methods and
  `Private` state, so reuse is delegation, not subclassing.
- [Inline error handling](https://learn.microsoft.com/en-us/previous-versions/53f3k80h%28v=vs.85%29):
  `On Error Resume Next` continues after a failure so the next statement can
  read `Err.Number`.
- The host supplies the library: the same `.vbs` runs under IIS, WSH or a
  third-party application, and each host exposes a different object model.
- Late binding reaches declarations too: a
  [class object](https://learn.microsoft.com/en-us/previous-versions/23t9k18c%28v=vs.85%29)
  cannot be typed, so `Dim x As New Counter` is not available and every member
  resolves at run time.

## Status

Deprecated, not gone. Microsoft announced deprecation in October 2023; Windows
11 24H2 ships it as a pre-enabled Feature on Demand, around 2027 that default
turns off, and a later phase removes the DLLs.

## History

Version 1.0 shipped with Internet Explorer 3.0 in 1996 and 2.0 with IIS 3.0
the same year, adding `CreateObject` and arrays. Version 5.0 brought classes,
the [RegExp object](https://learn.microsoft.com/en-us/previous-versions/yab2dx62%28v=vs.85%29),
`Eval`/`Execute` and function pointers; 5.8, the highest release in Microsoft's
version table, arrived with Internet Explorer 8 and Windows 7.
